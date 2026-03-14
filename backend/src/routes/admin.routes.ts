// backend/src/routes/admin.routes.ts

import { Router } from 'express';

import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { uploadDocument, uploadEventPoster, uploadImage } from '@/middlewares/file-upload.middleware';

import { UserRepository } from '@/repositories/implementations/user.repository';

import { UserManagementService } from '@/services/user-services/implementations/userManagement.service';
import { UserProfileService } from '@/services/user-services/implementations/userProfile.service';
import { HostManagementServices } from '@/services/host-services/implementations/HostManagement.service';

import { UserController } from '@/controllers/implementations/user.controller';
import { HostController } from '@/controllers/implementations/host.controller';


import { validateRequest } from '@/middlewares/validate.middleware';
import { HostManageSchema, HostUpgradeSchema } from '@/schemas/host.schema';
import { BookingIdParamSchema, EventIdParamSchema, HostIdParamSchema } from '@/schemas/mongo.schema';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { UserRole } from '@/constants/roles-and-statuses';
import { EventManagementServices } from '@/services/event-services/implementations/eventManagement.service';
import { EventRepository } from '@/repositories/implementations/event.repository';
import { EventController } from '@/controllers/implementations/event.controller';
import { suspendEventSchema, UpdateEventFormSchema } from '@/schemas/event.schema';
import { BookingController } from '@/controllers/implementations/booking.controller';
import { BookingService } from '@/services/booking-services/implementations/booking.service';
import { BookingRepository } from '@/repositories/implementations/booking.repository';
import { cancelBookingSchema } from '@/schemas/booking.schema';
import { RazorpayProvider } from '@/services/payment-services/providers/razorpay.provider';
import { PaymentService } from '@/services/payment-services/implementations/payment.service';
import { TicketService } from '@/services/ticket-services/implementations/ticket.service';






// ──  REPOSITORIES
const userRepo = new UserRepository();
const eventRepo = new EventRepository();
const bookingRepo = new BookingRepository();



// ──  PROVIDERS
const razorPayProvider = new RazorpayProvider();




// ──  SERVICES
const ticketService = new TicketService();
const paymentServices = new PaymentService(razorPayProvider);
const userManagementServices = new UserManagementService(userRepo);
const userProfileServices = new UserProfileService(userRepo);
const hostManagementServices = new HostManagementServices(userRepo);
const bookingServices = new BookingService(bookingRepo, eventRepo, userRepo, paymentServices, ticketService);
const eventManagementServices = new EventManagementServices(eventRepo, bookingServices);




// ──  CONTROLLERS ──
const userController = new UserController(userProfileServices, userManagementServices);
const hostController = new HostController(hostManagementServices);
const eventController = new EventController(eventManagementServices);
const bookingController = new BookingController(bookingServices);




const adminRouter = Router();



adminRouter.use(authenticate);
adminRouter.use(authorize(UserRole.ADMIN));





// User management
adminRouter.get(ADMIN_ROUTES.GET_USERS, userController.getAllUsers.bind(userController));
adminRouter.put(ADMIN_ROUTES.EDIT_USER, uploadImage.single("profileImage"), userController.editUserByAdmin.bind(userController));
adminRouter.delete(ADMIN_ROUTES.DELETE_USER, userController.deleteUser.bind(userController));
adminRouter.patch(ADMIN_ROUTES.TOGGLE_BLOCK_USER, userController.toggleUserBlock.bind(userController));
adminRouter.post(ADMIN_ROUTES.CREATE_USER, uploadImage.single("profileImage"), userController.createUserByAdmin.bind(userController));


// Host management
adminRouter.get(ADMIN_ROUTES.GET_HOSTS, hostController.getAllHosts.bind(hostController));
adminRouter.patch(ADMIN_ROUTES.MANAGE_HOST_REQUEST, 
    validateRequest({body: HostManageSchema, params: HostIdParamSchema}), 
    hostController.manageHostStatus.bind(hostController)
);
adminRouter.put(ADMIN_ROUTES.UPDATE_HOST, 
    uploadDocument.single('hostDocument'), 
    validateRequest({body: HostUpgradeSchema, params: HostIdParamSchema}), 
    hostController.updateHostByAdmin.bind(hostController)
);

// adminRouter.post('/users/:userId/convert-host',
//     // uploadDocument.single('hostDocument'), validateRequest({body: HostUpgradeSchema}), 
//     // hostController.convertToHost.bind(hostController)
// );




// event management
adminRouter.get(ADMIN_ROUTES.GET_EVENTS, eventController.getAllEvents.bind(eventController));
adminRouter.patch(ADMIN_ROUTES.SUSPEND_EVENT, validateRequest({body: suspendEventSchema, params: EventIdParamSchema}), eventController.suspendEvent.bind(eventController));
adminRouter.delete(ADMIN_ROUTES.DELETE_EVENT, validateRequest({params: EventIdParamSchema}), eventController.deleteEvent.bind(eventController));
adminRouter.patch(ADMIN_ROUTES.UPDATE_EVENT, uploadEventPoster.single("eventPosterImage"), validateRequest({ body: UpdateEventFormSchema, params: EventIdParamSchema }), eventController.updateEventByAdmin.bind(eventController)
);


// booking management
adminRouter.get(ADMIN_ROUTES.GET_BOOKINGS, bookingController.getAdminBookings.bind(bookingController));
adminRouter.put(ADMIN_ROUTES.CANCEL_BOOKING, validateRequest({body: cancelBookingSchema, params: BookingIdParamSchema}), bookingController.cancelBookingByAdmin.bind(bookingController));


export default adminRouter;