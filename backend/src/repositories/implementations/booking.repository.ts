// backend/src/repositories/implementations/booking.repository.ts

import { ClientSession, PipelineStage, Types } from "mongoose";
import Booking from "@/models/implementations/booking.model";
import { BaseRepository } from "@/repositories/base.repository";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { 
  CancelBookingInput, 
  BookingEntity, 
  BookingEntityPopulated, 
  BulkCancelBookingsInput, 
  ConfirmBookingInput, 
  CreateBookingInput, 
  MarkRefundedInput 
} from "@/entities/booking.entity";
import { 
  mapBookingModelToEntity, 
  mapPopulatedBookingModelToEntity 
} from "@/mappers/booking.mapper";
import { 
  BookingFacetResult, 
  GetBookingsFilter, 
  GetBookingsResult, 
  IBookingModel, 
  IBookingPopulatedUserAndEvent, 
  MajorEventChange 
} from "@/types/booking.types";
import { BOOKING_STATUSES } from "@/constants/booking.constants";
import { PAYMENT_STATUSES } from "@/constants/payment.constants";




const EVENT_POPULATE_SELECT =
  "title category posterUrl startDateTime endDateTime format locationName onlineLink";




export class BookingRepository extends BaseRepository<IBookingModel> implements IBookingRepository {
  constructor() {
    super(Booking);
  }


  async createBooking(createBookingInput: CreateBookingInput, options: { session?: ClientSession } = {}): Promise<BookingEntity> {
    const dbInput = {
      ...createBookingInput,
      _id: typeof createBookingInput._id === 'string' 
        ? new Types.ObjectId(createBookingInput._id) 
        : createBookingInput._id,
    };

    const bookingData: IBookingModel = await this.createOne(dbInput as Partial<IBookingModel>, options);
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



  async getBookingByPaymentId(paymentId: string): Promise<BookingEntityPopulated | null> {
    const booking: IBookingPopulatedUserAndEvent | null = await this.findOneQuery({ "payment.paymentId": paymentId })
      .populate("userRef", "name email")
      .populate("eventRef", "title")
      .lean<IBookingPopulatedUserAndEvent>();

    return booking ? mapPopulatedBookingModelToEntity(booking) : null;
  }


  async getBookingByQrToken(token: string): Promise<BookingEntity | null> {
    const booking = await this.findOneQuery({ qrToken: token })
      .lean<IBookingModel>();

    return booking ? mapBookingModelToEntity(booking) : null;
  }


  async confirmOnlineBooking(
    bookingId: string, 
    input: ConfirmBookingInput, 
    options?: { session?: ClientSession }
  ): Promise<BookingEntity | null> {
    const updated = await this.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          bookingStatus       : input.bookingStatus,
          qrToken             : input.qrToken,
          "payment.paymentId" : input.payment.paymentId,
          "payment.signature" : input.payment.signature,
          "payment.status"    : input.payment.status,
          "payment.paidAt"    : input.payment.paidAt,
        },
      },
    );

    return updated ? mapBookingModelToEntity(updated) : null;
  }



  async confirmWalletRetryBooking(
    bookingId: string, 
    qrToken: string, 
    walletOrderId: string, 
    options?: { session?: ClientSession }
  ): Promise<BookingEntity | null> {
    const updated = await this.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          bookingStatus       : BOOKING_STATUSES.CONFIRMED,
          qrToken             : qrToken,
          "payment.orderId"   : walletOrderId,
          "payment.status"    : PAYMENT_STATUSES.COMPLETED,
          "payment.paidAt"    : new Date(),
          // Unset paymentId and signature in case they were populated by a failed Razorpay attempt
          $unset: { 
            "payment.paymentId": "", 
            "payment.signature": "" 
          }
        },
      },
      options
    );

    return updated ? mapBookingModelToEntity(updated) : null;
  }



  async updateBookingPaymentOrderId(bookingId: string, newOrderId: string): Promise<void> {
    const bookingResult: IBookingModel | null = await this.findByIdAndUpdate(bookingId, { 
        $set: { 
          "payment.orderId": newOrderId 
        } 
      }
    );

    if (!bookingResult) {
      throw new Error("Failed to update payment order ID: Booking not found in database.");
    }
  }


  // need this function ??
  async markBookingFailed(bookingId: string): Promise<void> {
    await this.findByIdAndUpdate(bookingId, {
      $set: {
        bookingStatus   : BOOKING_STATUSES.FAILED,
        "payment.status": PAYMENT_STATUSES.FAILED,
      },
    });
  }



  // do this with cron job or bullMQ (see bottom)
  async markBookingPaymentFailed(bookingId: string): Promise<void> {
    await this.findByIdAndUpdate(bookingId, {
      $set: {
        "payment.status": PAYMENT_STATUSES.FAILED,
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
          bookingStatus: { $in: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED] },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$quantity" } },
      },
    ]);

    return result[0]?.total ?? 0;
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
      { eventRef: new Types.ObjectId(eventId), bookingStatus: BOOKING_STATUSES.CONFIRMED },
      {
        $set: {
          majorEventChange  : data.majorEventChange,
          gracePeriodEnd    : data.gracePeriodEnd,
        },
      }
    );
  }


  async findConfirmedBookingsForEvent(eventId: string): Promise<BookingEntityPopulated[]> {
    const bookings: IBookingPopulatedUserAndEvent[] = await this.findManyQuery({ 
      eventRef     : new Types.ObjectId(eventId), 
      bookingStatus: { $in: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.ATTENDED] }
    })
    .populate("eventRef", EVENT_POPULATE_SELECT)
    .lean<IBookingPopulatedUserAndEvent[]>();

    return bookings.map(mapPopulatedBookingModelToEntity);
  }



  async findPendingBookingsForEvent(eventId: string): Promise<BookingEntityPopulated[]> {
    const bookings: IBookingPopulatedUserAndEvent[] = await this.findManyQuery({ 
      eventRef:      new Types.ObjectId(eventId), 
      bookingStatus: BOOKING_STATUSES.PENDING 
    })
    .populate("eventRef", EVENT_POPULATE_SELECT)
    .lean<IBookingPopulatedUserAndEvent[]>();

    return bookings.map(mapPopulatedBookingModelToEntity);
  }



  async bulkCancelBookings(bookingIds: string[], updateInput: BulkCancelBookingsInput): Promise<void> {
    await this.updateMany(
      { _id: { $in: bookingIds.map(id => new Types.ObjectId(id)) } },
      { $set: updateInput }
    );
  }


}




// When should bookingStatus be marked FAILED?
// This is a great architectural question.

// If a user's card is declined (and the webhook sends payment.failed), we only mark payment.status = FAILED. We leave the bookingStatus = PENDING.

// Why? Because the user might just have typed their CVV wrong. We want them to click "Retry Payment" on the frontend and try again.

// So, when does a booking actually become FAILED?
// In an industry-standard system, a booking becomes FAILED (or EXPIRED) if the user abandons the payment entirely and never comes back.

// Usually, you would have a Background Cron Job (using a library like node-cron or BullMQ) that runs every 30 minutes. It looks for bookings like this:

// TypeScript
// {
//    bookingStatus: "pending",
//    createdAt: { $lt: thirtyMinutesAgo }
// }
// The Cron Job then updates those old, abandoned bookings to BOOKING_STATUSES.FAILED. 
// This cleans up your database and stops the user from trying to pay for an event that might already be sold out hours later.