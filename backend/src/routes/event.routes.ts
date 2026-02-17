import { UserRole } from "@/constants/roles-and-statuses";
import { EVENT_ROUTES } from "@/constants/routes.constants";
import { EventController } from "@/controllers/implementations/event.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadDocument, uploadEventPoster } from "@/middlewares/file-upload.middleware";
import { validateRequest } from "@/middlewares/validate.middleware";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { EventFormSchema } from "@/schemas/event.schema";
import { EventManagementServices } from "@/services/event-services/implementations/eventManagement.service";
import { Router } from "express";


// REPOS
const eventRepo = new EventRepository();


// SERVICES
const eventService = new EventManagementServices(eventRepo);


// CONTROLLER
const eventController = new EventController(eventService);



export const eventRouter = Router();



eventRouter.post(EVENT_ROUTES.CREATE_EVENT, authenticate, authorize(UserRole.USER, UserRole.HOST), 
    uploadEventPoster.single('eventPosterImage'), validateRequest({body: EventFormSchema}), 
    eventController.createEvent.bind(eventController)
)


export default eventRouter;