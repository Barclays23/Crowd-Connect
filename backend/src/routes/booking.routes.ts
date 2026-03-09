// backend/src/routes/booking.routes.ts

import { Router }            from "express";
import { BookingController } from "@/controllers/implementations/booking.controller";
import { BookingService }    from "@/services/booking-services/implementations/booking.service";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { EventRepository }   from "@/repositories/implementations/event.repository";
import { authenticate }      from "@/middlewares/auth.middleware";
import { authorize }         from "@/middlewares/auth.middleware";
import { UserRole }          from "@/constants/roles-and-statuses";
import { validateBody, validateRequest }      from "@/middlewares/validate.middleware";
import {
  initiateBookingSchema,
  verifyPaymentSchema,
} from "@/schemas/booking.schema";
import { EventIdParamSchema } from "@/schemas/mongo.schema";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { BOOKING_ROUTES } from "@/constants/routes.constants";
import { PaymentService } from "@/services/payment-services/implementations/payment.service";
import { RazorpayProvider } from "@/services/payment-services/providers/razorpay.provider";



// ─── Dependency wiring ────────────────────────────────────────────────────────

const bookingRepo       = new BookingRepository();
const eventRepo         = new EventRepository();
const userRepo          = new UserRepository();


const razorpayProvider = new RazorpayProvider();
const paymentService   = new PaymentService(razorpayProvider);


const bookingService    = new BookingService(bookingRepo, eventRepo, userRepo, paymentService);


const bookingController = new BookingController(bookingService);



// ─── Router ───────────────────────────────────────────────────────────────────

const bookingRouter = Router();

bookingRouter.use(authenticate);
bookingRouter.use(authorize(UserRole.USER, UserRole.HOST, UserRole.ADMIN));



bookingRouter.get(
  BOOKING_ROUTES.MY_BOOKINGS,
  bookingController.getMyBookings.bind(bookingController)
);

bookingRouter.get(
  BOOKING_ROUTES.BOOKING_DETAILS,
  bookingController.getBookingById.bind(bookingController)
);
bookingRouter.put(
  BOOKING_ROUTES.CANCEL_BOOKING,
  bookingController.cancelBookingByUser.bind(bookingController)
);



export default bookingRouter;




// Booking Flow Comparison ----------------------------------------
// FREE EVENT
//   POST /bookings/initiate
//     → validates rules
//     → creates booking with CONFIRMED status immediately
//     → generates QR JWT
//     → increments event.soldTickets (revenue stays 0)
//     → returns { isFree: true, booking: { qrToken, ... } }
//   Frontend → goes straight to confirmation screen

// PAID EVENT
//   POST /bookings/initiate
//     → validates rules
//     → creates PENDING booking (no QR yet)
//     → creates Razorpay order
//     → returns { isFree: false, order: { orderId, amount, keyId } }
//   Frontend → opens Razorpay SDK

//   POST /bookings/verify-payment
//     → verifies HMAC signature
//     → generates QR JWT
//     → marks booking CONFIRMED
//     → increments event.soldTickets + grossTicketRevenue
//     → returns full BookingResponseDTO
//   Frontend → shows confirmation screen