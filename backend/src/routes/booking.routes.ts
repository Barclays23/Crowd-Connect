// backend/src/routes/booking.routes.ts

import { Router }            from "express";
import { BookingController } from "@/controllers/implementations/booking.controller";
import { BookingService }    from "@/services/booking-services/implementations/booking.service";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { EventRepository }   from "@/repositories/implementations/event.repository";
import { authenticate }      from "@/middlewares/auth.middleware";
import { authorize }         from "@/middlewares/auth.middleware";
import { UserRole }          from "@/constants/roles-and-statuses";
import { validateRequest }      from "@/middlewares/validate.middleware";
import {
  cancelBookingSchema,
} from "@/schemas/booking.schema";
import { BookingIdParamSchema } from "@/schemas/mongo.schema";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { BOOKING_ROUTES } from "@/constants/routes.constants";
import { PaymentService } from "@/services/payment-services/implementations/payment.service";
import { RazorpayProvider } from "@/services/payment-services/providers/razorpay.provider";
import { TicketService } from "@/services/ticket-services/implementations/ticket.service";
import { verifyRazorPayPaymentSchema } from "@/schemas/payment.schema";



// ─── Dependency wiring ────────────────────────────────────────────────────────

const bookingRepo       = new BookingRepository();
const eventRepo         = new EventRepository();
const userRepo          = new UserRepository();


const razorpayProvider = new RazorpayProvider();


const paymentService   = new PaymentService(razorpayProvider);
const ticketService    = new TicketService(bookingRepo, eventRepo);
const bookingService    = new BookingService(bookingRepo, eventRepo, userRepo, paymentService, ticketService);


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
  BOOKING_ROUTES.CANCEL_BOOKING, validateRequest({ body: cancelBookingSchema, params: BookingIdParamSchema }),
  bookingController.cancelBookingByUser.bind(bookingController)
);


bookingRouter.post(
  BOOKING_ROUTES.VERIFY_PAYMENT, authenticate, authorize(UserRole.USER, UserRole.HOST, UserRole.ADMIN), 
  validateRequest({params: BookingIdParamSchema, body: verifyRazorPayPaymentSchema}),
  bookingController.verifyAndConfirmPayment.bind(bookingController)
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