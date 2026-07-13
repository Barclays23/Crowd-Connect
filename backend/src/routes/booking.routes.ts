// backend/src/routes/booking.routes.ts

import { Router }            from "express";
import { BookingController } from "@/controllers/implementations/booking.controller";
import { BookingService }    from "@/services/booking-services/implementations/booking.service";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { EventRepository }   from "@/repositories/implementations/event.repository";
import { authenticate }      from "@/middlewares/auth.middleware";
import { authorize }         from "@/middlewares/auth.middleware";
import { validateRequest }      from "@/middlewares/validate.middleware";
import {
  cancelBookingSchema,
  initiateBookingSchema,
} from "@/schemas/booking.schema";
import { BookingIdParamSchema, EventIdParamSchema } from "@/schemas/mongo.schema";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { BOOKING_ROUTES } from "@/constants/routes.constants";
import { PaymentService } from "@/services/payment-services/implementations/payment.service";
import { RazorpayProvider } from "@/services/payment-services/providers/razorpay.provider";
import { TicketService } from "@/services/ticket-services/implementations/ticket.service";
import { verifyRazorPayPaymentSchema } from "@/schemas/payment.schema";
import { WalletService } from "@/services/wallet-services/implementations/wallet.service";
import { TransactionRepository } from "@/repositories/implementations/transaction.repository";
import { RedisCacheService } from "@/services/cache-services/implementations/redisCache.service";
import { PlatformSettingsService } from "@/services/platform-settings-services/implementations/platformSettings.service";
import { PlatformSettingsRepository } from "@/repositories/implementations/platformSettings.repository";
import { USER_ROLES } from "@/constants/user-system.constants";



// ─── Dependency wiring ────────────────────────────────────────────────────────

const bookingRepo       = new BookingRepository();
const eventRepo         = new EventRepository();
const userRepo          = new UserRepository();
const transactionRepo   = new TransactionRepository();
// const payoutRequestRepo   = new PayoutRequestRepository();
const settingsRepo      = new PlatformSettingsRepository();


const razorpayProvider = new RazorpayProvider();


const paymentService    = new PaymentService(razorpayProvider);
const ticketService     = new TicketService(bookingRepo, eventRepo);
const walletService     = new WalletService(userRepo, transactionRepo);
const cacheService      = new RedisCacheService();
const settingsService   = new PlatformSettingsService(settingsRepo);
const bookingService    = new BookingService(bookingRepo, eventRepo, userRepo, paymentService, ticketService, walletService, cacheService, settingsService);


const bookingController = new BookingController(bookingService);



// ─── Router ───────────────────────────────────────────────────────────────────

const bookingRouter = Router();

bookingRouter.use(authenticate);
bookingRouter.use(authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN));



bookingRouter.get(
  BOOKING_ROUTES.MY_BOOKINGS,
  bookingController.getMyBookings.bind(bookingController)
);

bookingRouter.get(
  BOOKING_ROUTES.BOOKING_DETAILS,
  bookingController.getBookingById.bind(bookingController)
);

bookingRouter.post(
  BOOKING_ROUTES.INITIATE_BOOKING, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN), 
  validateRequest({body: initiateBookingSchema, params: EventIdParamSchema}), 
  bookingController.initiateBooking.bind(bookingController)
);

bookingRouter.put(
  BOOKING_ROUTES.CANCEL_BOOKING, validateRequest({ body: cancelBookingSchema, params: BookingIdParamSchema }),
  bookingController.cancelBookingByUser.bind(bookingController)
);



// need to move this routes into webhook routes? or keep here?
bookingRouter.post(
  BOOKING_ROUTES.VERIFY_PAYMENT, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN), 
  validateRequest({params: BookingIdParamSchema, body: verifyRazorPayPaymentSchema}),
  bookingController.verifyAndConfirmPayment.bind(bookingController)
);


bookingRouter.post(
  BOOKING_ROUTES.RETRY_PAYMENT, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST),
  validateRequest({ params: BookingIdParamSchema }), bookingController.retryPayment.bind(bookingController)
);


export default bookingRouter;




// Booking Flow Comparison ----------------------------------------
// FREE EVENT
//   POST /bookings/initiate
//     → creates CONFIRMED booking, generates QR, increments increments event.soldTickets (grossTicketRevenue stays 0).
//     → returns { isFree: true, paymentMethod: 'NONE', populatedBooking }
//   Frontend → goes straight to confirmation screen


// PAID EVENT (with WALLET PAYMENT)
//   POST /bookings/initiate
//     → ACID Transaction: deducts from user wallet, credits admin wallet.
//     → creates CONFIRMED booking, generates QR, increments stats.
//     → returns { isFree: false, paymentMethod: 'WALLET', populatedBooking }


// PAID EVENT (with ONLINE PAYMENT)
//   POST /bookings/initiate
//     → creates PENDING booking (no QR yet).
//     → creates Razorpay/stripe payment order.
//     → returns { isFree: false, paymentMethod: 'ONLINE', order: { ... } }
//   Frontend → opens Razorpay/Stipe SDK


//   FRONTEND CALLBACK: POST /bookings/verify-payment
//     → verifies HMAC signature.
//     → generates QR JWT, marks booking CONFIRMED.
//     → increments increments event.soldTickets + grossTicketRevenue, credits Admin wallet via ACID transaction.
//   Frontend → shows confirmation screen.

//   WEBHOOK FALLBACK: POST /webhooks/razorpay (Event: payment.captured)
//     → checks if already CONFIRMED (Idempotency check).
//     → If still PENDING, bypasses HMAC (because webhook hash was verified) and forces confirmation via the same service method.


//     → returns full BookingResponseDTO
//   Frontend → shows confirmation screen




// User pays online and stays on the page: React hits booking.controller.ts -> Calls handleWebhookEvent -> verifyWebhookSignature -> processWebhookEvent -> strategy -> verifyPaymentAndConfirmBooking -> Booking Confirmed. (When the webhook arrives 2 seconds later, it hits the Idempotency check and ignores it).

// User pays online but closes the browser: React crashes. But Razorpay hits webhook.controller.ts -> Calls verifyPaymentAndConfirmBooking -> Booking Confirmed safely in the background.