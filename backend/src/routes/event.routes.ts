import { UserRole } from "@/constants/roles-and-statuses";
import { EVENT_ROUTES } from "@/constants/routes.constants";
import { BookingController } from "@/controllers/implementations/booking.controller";
import { EventController } from "@/controllers/implementations/event.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadDocument, uploadEventPoster } from "@/middlewares/file-upload.middleware";
import { validateParams, validateRequest } from "@/middlewares/validate.middleware";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { initiateBookingSchema } from "@/schemas/booking.schema";
import { CreateEventFormSchema, UpdateEventFormSchema } from "@/schemas/event.schema";
import { EventIdParamSchema } from "@/schemas/mongo.schema";
import { BookingService } from "@/services/booking-services/implementations/booking.service";
import { EventManagementServices } from "@/services/event-services/implementations/eventManagement.service";
import { PaymentService } from "@/services/payment-services/implementations/payment.service";
import { RazorpayProvider } from "@/services/payment-services/providers/razorpay.provider";
import { TicketService } from "@/services/ticket-services/implementations/ticket.service";
import { Router } from "express";


// REPOS
const eventRepo = new EventRepository();
const bookingRepo = new BookingRepository();
const userRepo = new UserRepository();


// PROVIDERS
const razorPayProvider = new RazorpayProvider();


// SERVICES
const ticketService = new TicketService();
const paymentService   = new PaymentService(razorPayProvider);
const bookingService    = new BookingService(bookingRepo, eventRepo, userRepo, paymentService, ticketService);
const eventService = new EventManagementServices(eventRepo, bookingService);


// CONTROLLER
const eventController = new EventController(eventService);
const bookingController = new BookingController(bookingService);





export const eventRouter = Router();



eventRouter.post(EVENT_ROUTES.CREATE_EVENT, authenticate, authorize(UserRole.USER, UserRole.HOST), 
    uploadEventPoster.single('eventPosterImage'), validateRequest({body: CreateEventFormSchema}), 
    eventController.createEvent.bind(eventController)
)

eventRouter.patch(EVENT_ROUTES.UPDATE_EVENT,
   authenticate, authorize(UserRole.USER, UserRole.HOST),
   uploadEventPoster.single("eventPosterImage"), validateRequest({ body: UpdateEventFormSchema }),
   eventController.updateEventByHost.bind(eventController)
);

eventRouter.patch(EVENT_ROUTES.PUBLISH_EVENT, authenticate, authorize(UserRole.HOST), 
    validateParams(EventIdParamSchema), 
    eventController.publishEvent.bind(eventController)
);

eventRouter.patch(EVENT_ROUTES.CANCEL_EVENT, authenticate, authorize(UserRole.HOST), 
    validateParams(EventIdParamSchema), 
    eventController.cancelEvent.bind(eventController)
);

eventRouter.get(EVENT_ROUTES.MY_EVENTS, authenticate, authorize(UserRole.USER, UserRole.HOST, UserRole.ADMIN), 
    eventController.getUserEvents.bind(eventController)
);

eventRouter.get(EVENT_ROUTES.PUBLIC_EVENTS,
    eventController.getDiscoveryEvents.bind(eventController)
);

eventRouter.get(EVENT_ROUTES.EVENT_DETAILS,
    eventController.getEventDetails.bind(eventController)
);

eventRouter.post(
  EVENT_ROUTES.INITIATE_BOOKING, authenticate, authorize(UserRole.USER, UserRole.HOST, UserRole.ADMIN), 
  validateParams(EventIdParamSchema), 
  bookingController.initiateBooking.bind(bookingController)
);


export default eventRouter;