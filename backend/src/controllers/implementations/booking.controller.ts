// backend/src/controllers/implementations/booking.controller.ts

import { Request, Response, NextFunction } from "express";
import { IBookingService } from "@/services/booking-services/interfaces/IBookingService";
import { 
  BookingOrderRequestDTO, 
  BookingResponseDTO, 
  GetBookingsResponseDTO, 
  InitiateBookingResponseDTO, 
  VerifyPaymentRequestDTO 
} from "@/dtos/booking.dto";
import { 
  GetBookingsFilter, 
  BookingSortField, 
  ALLOWED_BOOKING_SORT_FIELDS 
} from "@/types/booking.types";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { IBookingController } from "@/controllers/interfaces/IBookingController";
import { BOOKING_MESSAGES, PAYMENT_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";
import { EventFormat } from "@/constants/event.constants";
import { BookingStatus } from "@/constants/booking.constants";
import { UserRole } from "@/constants/user-system.constants";
import { PaymentMethod } from "@/constants/payment.constants";




export class BookingController implements IBookingController{
  constructor(
    private readonly _bookingService: IBookingService
  ) {}


  async initiateBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
        return;
      }

      console.log('req.body: ', req.body);

      const bookingReqDto: BookingOrderRequestDTO = {
        ...req.body,
        eventId: req.params.eventId,
        userId: req.user.userId,
      };

      const result: InitiateBookingResponseDTO = await this._bookingService.initiateBooking(bookingReqDto);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: result, // (isFree + populatedBooking) OR (isFree + order)
      });

    } catch (error: unknown) {
      next(error);
    }
  }

  
  async verifyAndConfirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
        return;
      }
      
      const userId: string                = req.user.userId;
      const dto: VerifyPaymentRequestDTO  = req.body;

      const populatedBooking: BookingResponseDTO = await this._bookingService.verifyPaymentAndConfirmBooking(userId, dto);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payment verified. Booking confirmed!",
        data: populatedBooking,
      });

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.verifyAndConfirmPayment:", msg);
      next(error);
    }
  }



  async retryPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId: string = req.params.bookingId as string;
      const paymentMethod: PaymentMethod = req.body.paymentMethod as PaymentMethod; // "ONLINE" or "WALLET"
      const userId = req.user!.userId;

      if (!bookingId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          success: false, 
          message: BOOKING_MESSAGES.BOOKING_ID_MISSING
        });
        return;
      }

      if (!paymentMethod) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          success: false, 
          message: PAYMENT_MESSAGES.INVALID_ID_MISSING
        });
        return;
      }

      const result = await this._bookingService.retryPayment(bookingId, userId, paymentMethod);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PAYMENT_MESSAGES.RETRY_PAYMENT_PROCESSED,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };



  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: USER_MESSAGES.USER_INFORMATION_MISSING});
        return;
      }
      const userId: string = req.user.userId;

      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const status = (req.query.status as string)?.trim() || "";
      const search      = (req.query.search      as string)?.trim() || "";
      const eventFormat = (req.query.eventFormat as EventFormat)?.trim() || "";

      const eventId = (req.query.eventId as string)        || undefined;

      const sortBy: BookingSortField = ALLOWED_BOOKING_SORT_FIELDS.includes(req.query.sortBy as BookingSortField)
        ? (req.query.sortBy as BookingSortField)
        : "createdAt";

      const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

      const filters: GetBookingsFilter = {
        eventId,
        page,
        limit,
        status: status ? (status as BookingStatus) : undefined,
        eventFormat: eventFormat ? (eventFormat as EventFormat) : undefined,
        search: search ? search : undefined,
        sortBy,
        sortOrder,
      };

      console.log("✅ Parsed filters for getMyBookings:", filters);

      const result: GetBookingsResponseDTO = await this._bookingService.getMyBookings(userId, filters);

      res.status(HTTP_STATUS.OK).json({
        success:    true,
        bookings:   result.bookings,
        pagination: result.pagination,
      });

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.getMyBookings:", msg);
      next(error);
    }
  }



  async getAdminBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page    = parseInt(req.query.page  as string) || 1;
      const limit   = parseInt(req.query.limit as string) || 10;

      const status  = (req.query.status  as BookingStatus) || undefined;
      const search      = (req.query.search      as string)?.trim() || "";
      const eventFormat = (req.query.eventFormat as EventFormat)?.trim() || "";

      const sortBy: BookingSortField = ALLOWED_BOOKING_SORT_FIELDS.includes(req.query.sortBy as BookingSortField)
        ? (req.query.sortBy as BookingSortField)
        : "createdAt";

      const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

      const filters: GetBookingsFilter = {
        // eventId,
        page,
        limit,
        status:      status      ? (status as BookingStatus) : undefined,
        eventFormat: eventFormat ? (eventFormat as EventFormat) : undefined,
        search:      search      ? search : undefined,
        sortBy,
        sortOrder,
      };

      console.log("✅ Parsed filters for getAdminBookings:", filters);

      // const result: GetBookingsResponseDTO = await this._bookingService.getAdminBookings(filters);
      const result: GetBookingsResponseDTO = await this._bookingService.getBookingsList(filters);

      res.status(HTTP_STATUS.OK).json({
        success:    true,
        bookingsData:   result.bookings,
        pagination: result.pagination,
      });

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.getAdminBookings:", msg);
      next(error);
    }
  }


  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId || !req.user.role) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User or Role missing" });
        return;
      }
      const requestingUserId = req.user.userId;
      const role             = req.user.role as UserRole;
      const bookingId        = req.params.bookingId as string;

      const booking = await this._bookingService.getBookingById(bookingId, requestingUserId, role);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data:    booking,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.getBookingById:", msg);
      next(error);
    }
  }


  async cancelBookingByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
        return;
      }
      
      const userId    = req.user.userId as string;
      const bookingId = req.params.bookingId as string;
      const { cancelReason } = req.body;
      
      await this._bookingService.cancelBookingByUser(bookingId, userId, cancelReason);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: BOOKING_MESSAGES.BOOKING_CANCELLED,
      });

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.cancelBookingByUser:", msg);
      next(error);
    }
  }


  async cancelBookingByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.bookingId as string;
      const { cancelReason } = req.body;
      
      await this._bookingService.cancelBookingByAuthority(bookingId, cancelReason);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: BOOKING_MESSAGES.BOOKING_CANCELLED,
      });

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.cancelBookingByAdmin:", msg);
      next(error);
    }
  }


}