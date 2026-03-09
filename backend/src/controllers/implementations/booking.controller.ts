// backend/src/controllers/implementations/booking.controller.ts

import { Request, Response, NextFunction } from "express";
import { IBookingService } from "@/services/booking-services/interfaces/IBookingService";
import { BookingOrderRequestDTO, GetBookingsResponseDTO, InitiateBookingResponseDTO, VerifyPaymentRequestDTO } from "@/dtos/booking.dto";
import { BOOKING_STATUS, GetBookingsFilter, BookingSortField, ALLOWED_BOOKING_SORT_FIELDS } from "@/types/booking.types";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { IBookingController } from "@/controllers/interfaces/IBookingController";
import { EVENT_FORMAT } from "@/types/event.types";
import { BOOKING_MESSAGES } from "@/constants/booking.constants";




export class BookingController implements IBookingController{
  constructor(private readonly _bookingService: IBookingService) {}


  async initiateBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingReqDto: BookingOrderRequestDTO = {
        ...req.body,
        eventId: req.params.eventId,
        userId: req.user.userId,
      };

      const result: InitiateBookingResponseDTO = await this._bookingService.initiateBooking(bookingReqDto);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: result, // (isFree + populatedBooking) OR (isFree + order)
      });

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.initiateBooking:", msg);
      next(error);
    }
  }


  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.userId;

      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const status = (req.query.status as string)?.trim() || "";
      const search      = (req.query.search      as string)?.trim() || "";
      const eventFormat = (req.query.eventFormat as EVENT_FORMAT)?.trim() || "";

      const sortBy: BookingSortField = ALLOWED_BOOKING_SORT_FIELDS.includes(req.query.sortBy as BookingSortField)
        ? (req.query.sortBy as BookingSortField)
        : "createdAt";

      const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

      const filters: GetBookingsFilter = {
        page,
        limit,
        status: status ? (status as BOOKING_STATUS) : undefined,
        eventFormat: eventFormat ? (eventFormat as EVENT_FORMAT) : undefined,
        search: search ? search : undefined,
        sortBy,
        sortOrder,
      };

      console.log("✅ Parsed filters for getMyBookings:", filters);

      const result: GetBookingsResponseDTO = await this._bookingService.getMyBookings(userId, filters);

      res.status(HttpStatus.OK).json({
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
      const status  = (req.query.status  as BOOKING_STATUS) || undefined;
      const eventId = (req.query.eventId as string)        || undefined;
      const search      = (req.query.search      as string)?.trim() || "";
      const eventFormat = (req.query.eventFormat as EVENT_FORMAT)?.trim() || "";

      const sortBy: BookingSortField = ALLOWED_BOOKING_SORT_FIELDS.includes(req.query.sortBy as BookingSortField)
        ? (req.query.sortBy as BookingSortField)
        : "createdAt";

      const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

      const filters: GetBookingsFilter = {
        page,
        limit,
        status:      status      ? (status as BOOKING_STATUS) : undefined,
        eventFormat: eventFormat ? (eventFormat as EVENT_FORMAT) : undefined,
        search:      search      ? search : undefined,
        sortBy,
        sortOrder,
      };

      console.log("✅ Parsed filters for getAdminBookings:", filters);

      const result: GetBookingsResponseDTO = await this._bookingService.getAdminBookings(filters);

      res.status(HttpStatus.OK).json({
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
      const requestingUserId = req.user.userId;
      const role             = req.user.role as "user" | "host" | "admin";
      const { bookingId }    = req.params;

      const booking = await this._bookingService.getBookingById(bookingId, requestingUserId, role);

      res.status(HttpStatus.OK).json({
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
      const userId    = req.user.userId;
      const { bookingId } = req.params;
      const { cancelReason } = req.body;
      
      await this._bookingService.cancelBookingByUser(bookingId, userId, cancelReason);

      res.status(HttpStatus.OK).json({
        success: true,
        message: BOOKING_MESSAGES.BOOKING_CANCELLED,
      });

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in BookingController.cancelBookingByUser:", msg);
      next(error);
    }
  }


}