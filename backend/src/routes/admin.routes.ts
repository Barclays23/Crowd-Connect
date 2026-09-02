// backend/src/routes/admin.routes.ts

import { Router } from 'express';

import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { 
    uploadDocument, 
    uploadEventPoster, 
    uploadImage 
} from '@/middlewares/file-upload.middleware';

import { validateRequest } from '@/middlewares/validate.middleware';
import { HostApplicationSchema, HostPermissionSchema, HostUpgradeSchema } from '@/schemas/host.schema';
import { 
    BookingIdParamSchema, 
    EventIdParamSchema, 
    HostIdParamSchema, 
    PayoutIdParamSchema 
} from '@/schemas/mongo.schema';
import { ADMIN_ROUTES } from '@/constants/routes.constants';
import { suspendEventSchema, UpdateEventFormSchema } from '@/schemas/event.schema';
import { cancelBookingSchema } from '@/schemas/booking.schema';
import { ReviewPayoutBodySchema } from '@/schemas/payout.schema';
import { USER_ROLES } from '@/constants/user-system.constants';
import { AdminReviewQuerySchema } from '@/schemas/review.schema';

import { 
    bookingController, 
    eventController, 
    hostController, 
    payoutController, 
    reviewController, 
    userController 
} from '@/container/dependencies';







const adminRouter = Router();



adminRouter.use(authenticate);
adminRouter.use(authorize(USER_ROLES.ADMIN));





// User management
adminRouter.get(ADMIN_ROUTES.GET_USERS, userController.getAllUsers.bind(userController));
adminRouter.put(ADMIN_ROUTES.EDIT_USER, uploadImage.single("profileImage"), userController.editUserByAdmin.bind(userController));
adminRouter.delete(ADMIN_ROUTES.DELETE_USER, userController.deleteUser.bind(userController));
adminRouter.patch(ADMIN_ROUTES.TOGGLE_BLOCK_USER, userController.toggleUserBlock.bind(userController));
adminRouter.post(ADMIN_ROUTES.CREATE_USER, uploadImage.single("profileImage"), userController.createUserByAdmin.bind(userController));


// Host management
adminRouter.get(ADMIN_ROUTES.GET_HOSTS, hostController.getAllHosts.bind(hostController));
adminRouter.patch(ADMIN_ROUTES.MANAGE_HOST_APPLICATION, validateRequest({body: HostApplicationSchema, params: HostIdParamSchema}), hostController.manageHostApplication.bind(hostController));
adminRouter.patch(ADMIN_ROUTES.MANAGE_HOST_PERMISSION, validateRequest({body: HostPermissionSchema, params: HostIdParamSchema}), hostController.manageHostPermission.bind(hostController));
adminRouter.put(ADMIN_ROUTES.UPDATE_HOST_DETAILS, uploadDocument.single('hostDocument'), validateRequest({body: HostUpgradeSchema, params: HostIdParamSchema}), hostController.updateHostDetailsByAdmin.bind(hostController));
adminRouter.patch(ADMIN_ROUTES.UPDATE_HOST_LOGO, uploadImage.single('organizationLogo'), hostController.updateHostLogoByAdmin.bind(hostController));

adminRouter.post(ADMIN_ROUTES.CONVERT_TO_HOST,
    uploadDocument.fields([
        { name: 'hostDocument', maxCount: 1 }, 
        { name: 'organizationLogo', maxCount: 1 }
    ]),
    validateRequest({body: HostUpgradeSchema}), hostController.convertToHost.bind(hostController));




// event management
adminRouter.get(ADMIN_ROUTES.GET_EVENTS, eventController.getAllEvents.bind(eventController));
adminRouter.patch(ADMIN_ROUTES.SUSPEND_EVENT, validateRequest({body: suspendEventSchema, params: EventIdParamSchema}), eventController.suspendEvent.bind(eventController));
adminRouter.delete(ADMIN_ROUTES.DELETE_EVENT, validateRequest({params: EventIdParamSchema}), eventController.deleteEventByAdmin.bind(eventController));
adminRouter.patch(ADMIN_ROUTES.UPDATE_EVENT, uploadEventPoster.single("eventPosterImage"), validateRequest({ body: UpdateEventFormSchema, params: EventIdParamSchema }), eventController.updateEventByAdmin.bind(eventController)
);




// booking management
adminRouter.get(ADMIN_ROUTES.GET_BOOKINGS, bookingController.getAdminBookings.bind(bookingController));
adminRouter.put(ADMIN_ROUTES.CANCEL_BOOKING, validateRequest({body: cancelBookingSchema, params: BookingIdParamSchema}), bookingController.cancelBookingByAdmin.bind(bookingController));




// payout request management
adminRouter.get(ADMIN_ROUTES.GET_PAYOUTS, payoutController.getAllPayouts.bind(payoutController));
adminRouter.put(ADMIN_ROUTES.REVIEW_PAYOUT, 
    validateRequest({ body: ReviewPayoutBodySchema, params: PayoutIdParamSchema }), 
    payoutController.reviewPayout.bind(payoutController)
);



// review & rating management
adminRouter.get(ADMIN_ROUTES.GET_REVIEWS, validateRequest({ query: AdminReviewQuerySchema }), reviewController.getAllReviewsForAdmin.bind(reviewController));



export default adminRouter;