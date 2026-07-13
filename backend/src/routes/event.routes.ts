import { USER_ROLES } from "@/constants/user-system.constants";
import { EVENT_ROUTES } from "@/constants/routes.constants";
import { EventController } from "@/controllers/implementations/event.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadEventPoster } from "@/middlewares/file-upload.middleware";
import { validateParams, validateRequest } from "@/middlewares/validate.middleware";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { PlatformSettingsRepository } from "@/repositories/implementations/platformSettings.repository";
import { TransactionRepository } from "@/repositories/implementations/transaction.repository";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { CreateEventFormSchema, UpdateEventFormSchema } from "@/schemas/event.schema";
import { EventIdParamSchema } from "@/schemas/mongo.schema";
import { BookingService } from "@/services/booking-services/implementations/booking.service";
import { RedisCacheService } from "@/services/cache-services/implementations/redisCache.service";
import { EventManagementServices } from "@/services/event-services/implementations/event.service";
import { PaymentService } from "@/services/payment-services/implementations/payment.service";
import { RazorpayProvider } from "@/services/payment-services/providers/razorpay.provider";
import { PlatformSettingsService } from "@/services/platform-settings-services/implementations/platformSettings.service";
import { EventQueueService } from "@/services/queue-services/implementaions/eventQueue.service";
import { TicketService } from "@/services/ticket-services/implementations/ticket.service";
import { WalletService } from "@/services/wallet-services/implementations/wallet.service";
import { Router } from "express";




// REPOS
const eventRepo         = new EventRepository();
const bookingRepo       = new BookingRepository();
const userRepo          = new UserRepository();
const transactionRepo   = new TransactionRepository();
const settingsRepo      = new PlatformSettingsRepository();


// PROVIDERS
const razorPayProvider = new RazorpayProvider();


// SERVICES
const ticketService     = new TicketService(bookingRepo, eventRepo);
const paymentService    = new PaymentService(razorPayProvider);
const walletService     = new WalletService(userRepo, transactionRepo);
const cacheService      = new RedisCacheService();
const eventQueueService = new EventQueueService();
const settingsService   = new PlatformSettingsService(settingsRepo);
const bookingService    = new BookingService(bookingRepo, eventRepo, userRepo, paymentService, ticketService, walletService, cacheService, settingsService);
const eventService      = new EventManagementServices(eventRepo, bookingService, cacheService, settingsService, eventQueueService);


// CONTROLLER
const eventController   = new EventController(eventService, bookingService);





export const eventRouter = Router();



eventRouter.post(EVENT_ROUTES.CREATE_EVENT, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST), 
    uploadEventPoster.single('eventPosterImage'), validateRequest({body: CreateEventFormSchema}), 
    eventController.createEvent.bind(eventController)
)

eventRouter.patch(EVENT_ROUTES.UPDATE_EVENT,
   authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST),
   uploadEventPoster.single("eventPosterImage"), validateRequest({ body: UpdateEventFormSchema }),
   eventController.updateEventByHost.bind(eventController)
);

eventRouter.patch(EVENT_ROUTES.PUBLISH_EVENT, authenticate, authorize(USER_ROLES.HOST), 
    validateParams(EventIdParamSchema), 
    eventController.publishEvent.bind(eventController)
);

eventRouter.patch(EVENT_ROUTES.CANCEL_EVENT, authenticate, authorize(USER_ROLES.HOST), 
    validateParams(EventIdParamSchema), 
    eventController.cancelEvent.bind(eventController)
);

eventRouter.get(EVENT_ROUTES.MY_EVENTS, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN), 
    eventController.getUserEvents.bind(eventController)
);

eventRouter.get(EVENT_ROUTES.PUBLIC_EVENTS,
    eventController.getDiscoveryEvents.bind(eventController)
);

eventRouter.get(EVENT_ROUTES.TRENDING_EVENTS,
    eventController.getTrendingEvents.bind(eventController)
);

// for public event details
eventRouter.get(EVENT_ROUTES.EVENT_DETAILS,
    eventController.getEventDetails.bind(eventController)
);


eventRouter.get(EVENT_ROUTES.GET_BOOKINGS_OF_EVENT, authenticate, authorize(USER_ROLES.HOST, USER_ROLES.ADMIN),
    eventController.getAllBookingsOfEvent.bind(eventController)
);




export default eventRouter;