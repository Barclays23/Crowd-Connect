import { USER_ROLES } from "@/constants/user-system.constants";
import { EVENT_ROUTES } from "@/constants/routes.constants";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadEventPoster } from "@/middlewares/file-upload.middleware";
import { validateParams, validateRequest } from "@/middlewares/validate.middleware";
import { CreateEventFormSchema, UpdateEventFormSchema } from "@/schemas/event.schema";
import { EventIdParamSchema } from "@/schemas/mongo.schema";
import { Router } from "express";
import { eventController } from "@/container/dependencies";





export const eventRouter = Router();



eventRouter.post(EVENT_ROUTES.CREATE_EVENT, authenticate, authorize(USER_ROLES.HOST), 
    uploadEventPoster.single('eventPosterImage'), validateRequest({body: CreateEventFormSchema}), 
    eventController.createEvent.bind(eventController)
)

eventRouter.patch(EVENT_ROUTES.UPDATE_EVENT,
   authenticate, authorize(USER_ROLES.HOST),
   uploadEventPoster.single("eventPosterImage"), validateRequest({ body: UpdateEventFormSchema }),
   eventController.updateEventByHost.bind(eventController)
);

eventRouter.patch(EVENT_ROUTES.PUBLISH_EVENT, authenticate, authorize(USER_ROLES.HOST), validateParams(EventIdParamSchema), eventController.publishEvent.bind(eventController));

eventRouter.patch(EVENT_ROUTES.CANCEL_EVENT, authenticate, authorize(USER_ROLES.HOST), validateParams(EventIdParamSchema), eventController.cancelEvent.bind(eventController));

eventRouter.delete(EVENT_ROUTES.DELETE_EVENT, authenticate, authorize(USER_ROLES.HOST), validateParams(EventIdParamSchema), eventController.deleteEventByHost.bind(eventController));

// Attendee Joining Online Event
eventRouter.post('/:eventId/join-online', authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST), validateParams(EventIdParamSchema), eventController.joinOnlineEvent.bind(eventController));



eventRouter.get(EVENT_ROUTES.MY_EVENTS, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN), eventController.getUserEvents.bind(eventController));

eventRouter.get(EVENT_ROUTES.GET_BOOKINGS_OF_EVENT, authenticate, authorize(USER_ROLES.HOST, USER_ROLES.ADMIN), eventController.getAllBookingsOfEvent.bind(eventController));



// PUBLIC ROUTES ---------------------------

eventRouter.get(EVENT_ROUTES.PUBLIC_EVENTS, eventController.getDiscoveryEvents.bind(eventController));

eventRouter.get(EVENT_ROUTES.TRENDING_EVENTS, eventController.getTrendingEvents.bind(eventController));

eventRouter.get(EVENT_ROUTES.EVENT_DETAILS, eventController.getEventDetails.bind(eventController));

// Public route for Event Organiser Portfolio
eventRouter.get(EVENT_ROUTES.ORGANISER_EVENTS, eventController.getOrganiserEvents.bind(eventController));




export default eventRouter;