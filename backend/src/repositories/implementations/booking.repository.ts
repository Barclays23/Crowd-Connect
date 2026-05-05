// backend/src/repositories/implementations/booking.repository.ts

import { ClientSession, PipelineStage, Types } from "mongoose";
import Booking from "@/models/implementations/booking.model";
import { BaseRepository } from "@/repositories/base.repository";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { CancelBookingInput, BookingEntity, BookingEntityPopulated, BulkCancelBookingsInput, ConfirmBookingInput, CreateBookingInput, MarkRefundedInput } from "@/entities/booking.entity";
import { mapBookingModelToEntity, mapPopulatedBookingModelToEntity } from "@/mappers/booking.mapper";
import { BOOKING_STATUS, BookingFacetResult, BookingFilterQuery, GetBookingsFilter, GetBookingsResult, IBookingModel, IBookingPopulatedUserAndEvent, MajorEventChange } from "@/types/booking.types";
import { PAYMENT_STATUS } from "@/types/booking.types";



const EVENT_POPULATE_SELECT =
  "title category posterUrl startDateTime endDateTime format locationName onlineLink";




export class BookingRepository extends BaseRepository<IBookingModel> implements IBookingRepository {
  constructor() {
    super(Booking);
  }


  async createBooking(createBookingInput: CreateBookingInput): Promise<BookingEntity> {
    const dbInput = {
      ...createBookingInput,
      _id: typeof createBookingInput._id === 'string' 
        ? new Types.ObjectId(createBookingInput._id) 
        : createBookingInput._id,
    };

    const bookingData: IBookingModel = await this.createOne(dbInput as Partial<IBookingModel>);
    return mapBookingModelToEntity(bookingData);
  }


  async getBookingById(bookingId: string): Promise<BookingEntityPopulated | null> {
    const booking = await this.findByIdQuery(bookingId)
      .populate("eventRef", EVENT_POPULATE_SELECT)
      .lean<IBookingPopulatedUserAndEvent>();

    return booking ? mapPopulatedBookingModelToEntity(booking) : null;
  }


  async getBookingByOrderId(orderId: string): Promise<BookingEntity | null> {
    const booking = await this.findOneQuery({ "payment.orderId": orderId })
      .lean<IBookingModel>();

    return booking ? mapBookingModelToEntity(booking) : null;
  }


  // async getBookingByPaymentId(paymentId: string): Promise<BookingEntity | null> {
  //   const booking: IBookingModel | null = await this.findOneQuery({ "payment.paymentId": paymentId })
  //     .lean<IBookingModel>();

  //   return booking ? mapBookingModelToEntity(booking) : null;
  // }

  async getBookingByPaymentId(paymentId: string): Promise<BookingEntityPopulated | null> {
    const booking = await this.findOneQuery({ "payment.paymentId": paymentId })
      .populate("eventRef", "title")
      .lean<IBookingPopulatedUserAndEvent>();

    return booking ? mapPopulatedBookingModelToEntity(booking) : null;
  }


  async getBookingByQrToken(token: string): Promise<BookingEntity | null> {
    const booking = await this.findOneQuery({ qrToken: token })
      .lean<IBookingModel>();

    return booking ? mapBookingModelToEntity(booking) : null;
  }


  async confirmBooking(
    bookingId: string, 
    input: ConfirmBookingInput, 
    options?: { session?: ClientSession }
  ): Promise<BookingEntity | null> {
    const updated = await this.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            bookingStatus:       input.bookingStatus,
            qrToken:             input.qrToken,
            "payment.paymentId": input.payment.paymentId,
            "payment.signature": input.payment.signature,
            "payment.status":    input.payment.status,
            "payment.paidAt":    input.payment.paidAt,
          },
        },
      );

    return updated ? mapBookingModelToEntity(updated) : null;
  }


  async markBookingFailed(bookingId: string): Promise<void> {
    await this.findByIdAndUpdate(bookingId, {
      $set: {
        bookingStatus   : BOOKING_STATUS.FAILED,
        "payment.status": PAYMENT_STATUS.FAILED,
      },
    });
  }


  async markBookingAsRefunded(
    bookingId: string, 
    refundDetails: MarkRefundedInput, 
    options: { session?: ClientSession } = {}
  ): Promise<BookingEntity | null> {
    const updateQuery = {
      $set: {
        paymentStatus: refundDetails.paymentStatus,
        "cancellation.refundId": refundDetails.refundId,
        "cancellation.refundedAt": refundDetails.refundedAt
      }
    };

    const updated = await this.findByIdAndUpdate(bookingId, updateQuery, options);
    
    return updated ? mapBookingModelToEntity(updated) : null;
  }


  async findBookings(filter: GetBookingsFilter): Promise<GetBookingsResult> {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      eventId,
      eventFormat,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filter;

    const initialMatch: Record<string, unknown> = {};
    
    if (status) initialMatch.bookingStatus = status;
    if (userId) initialMatch.userRef = new Types.ObjectId(userId);
    if (eventId) initialMatch.eventRef = new Types.ObjectId(eventId);

    const sortDirection: 1 | -1 = sortOrder === "asc" ? 1 : -1;
    const sortField: string = sortBy === "startDateTime" ? "eventRef.startDateTime" : sortBy;

    const pipeline: PipelineStage[] = [{ $match: initialMatch }];

    // populate events
    pipeline.push(
      {
        $lookup: {
          from: "events",          
          localField: "eventRef",  
          foreignField: "_id",     
          as: "eventRef",          
        },
      },
      { 
        $unwind: { 
          path: "$eventRef", 
          preserveNullAndEmptyArrays: true 
        } 
      }
    );

    // populate users
    pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "userRef",
        foreignField: "_id",
        as: "userRef",
      },
    },
    {
      $unwind: {
        path: "$userRef",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

    const postLookupMatch: Record<string, unknown> = {};

    if (eventFormat) {
      postLookupMatch["eventRef.format"] = eventFormat; 
    }

    if (search) {
      postLookupMatch["$or"] = [
        { ticketNo: { $regex: search, $options: "i" } },
        { "eventRef.title": { $regex: search, $options: "i" } },
        { "userRef.name": { $regex: search, $options: "i" } },
        { "userRef.email": { $regex: search, $options: "i" } },
      ];
    }

    if (Object.keys(postLookupMatch).length > 0) {
      pipeline.push({ $match: postLookupMatch });
    }

    const facetPipeline: PipelineStage[] = [
      ...pipeline,
      {
        $facet: {
          paginatedResults: [
            { $sort: { [sortField]: sortDirection } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCountQuery: [
            { $count: "total" }
          ]
        }
      }
    ];

    const result = await this.model.aggregate<BookingFacetResult>(facetPipeline).exec();

    const rawBookings = result[0]?.paginatedResults || [];
    const totalCount = result[0]?.totalCountQuery[0]?.total || 0;

    const bookings: BookingEntityPopulated[] = rawBookings.map(mapPopulatedBookingModelToEntity);

    return {
      bookings,
      pagination: {
        totalCount: totalCount,
        limit: limit,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }


  async sumConfirmedTicketsForUser(userId: string, eventId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          userRef:       new Types.ObjectId(userId),
          eventRef:      new Types.ObjectId(eventId),
          bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ATTENDED] },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$quantity" } },
      },
    ]);

    return result[0]?.total ?? 0;
  }


  // async updateBooking(bookingId: string, data: Partial<BookingEntity>): Promise<BookingEntity | null> {
  //   try {
  //     const updated = await this.findByIdAndUpdate(bookingId, data);
  //     return updated ? mapBookingModelToEntity(updated) : null;
  //   } catch (error) {
  //     const msg = error instanceof Error ? error.message : "Unknown error";
  //     console.error("Error in BookingRepository.updateBooking:", msg);
  //     throw error;
  //   }
  // }


  async decrementRemainingEntries(bookingId: string, count: number): Promise<BookingEntity | null> {
    const updated = await this.findByIdAndUpdate(
      bookingId,
      { $inc: { remainingEntries: -count } },
    );

    const updatedBooking: BookingEntity | null = updated ? mapBookingModelToEntity(updated) : null;

    return updatedBooking;
  }


  async cancelBooking(
    bookingId: string, 
    cancellationInput: CancelBookingInput, 
    options: { session?: ClientSession } = {}
  ): Promise<BookingEntity | null> {
    const { session } = options;

    const updated: IBookingModel | null = await this.findByIdAndUpdate(
      bookingId, 
      { $set: cancellationInput }, 
      { session }
    );

    return updated ? mapBookingModelToEntity(updated) : null;
  }



  async setGracePeriodForEvent(eventId: string, data: { gracePeriodEnd: Date; majorEventChange: MajorEventChange }): Promise<void> {
    await this.updateMany(
      { eventRef: new Types.ObjectId(eventId), bookingStatus: BOOKING_STATUS.CONFIRMED },
      {
        $set: {
          majorEventChange:     data.majorEventChange,
          refundGracePeriodEnd: data.gracePeriodEnd,
        },
      }
    );
  }


  async findConfirmedBookingsForEvent(eventId: string): Promise<BookingEntityPopulated[]> {
    const bookings: IBookingPopulatedUserAndEvent[] = await this.findManyQuery({ 
      eventRef     : new Types.ObjectId(eventId), 
      bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ATTENDED] }
    })
    .populate("eventRef", EVENT_POPULATE_SELECT)
    .lean<IBookingPopulatedUserAndEvent[]>();

    return bookings.map(mapPopulatedBookingModelToEntity);
  }



  async findPendingBookingsForEvent(eventId: string): Promise<BookingEntityPopulated[]> {
    const bookings: IBookingPopulatedUserAndEvent[] = await this.findManyQuery({ 
      eventRef:      new Types.ObjectId(eventId), 
      bookingStatus: BOOKING_STATUS.PENDING 
    })
    .populate("eventRef", EVENT_POPULATE_SELECT)
    .lean<IBookingPopulatedUserAndEvent[]>();

    return bookings.map(mapPopulatedBookingModelToEntity);
  }



  async bulkCancelBookings(
    bookingIds: string[],
    updateInput: BulkCancelBookingsInput
  ): Promise<void> {
    await this.updateMany(
      { _id: { $in: bookingIds.map(id => new Types.ObjectId(id)) } },
      { $set: updateInput }
    );
  }


}