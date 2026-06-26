// backend/src/routes/checkin.routes.ts

import { Router } from "express";
import { CheckinRepository }   from "@/repositories/implementations/checkin.repository";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { CheckinService } from "@/services/checkin-services/implementations/checkin.service";
import { CheckinController } from "@/controllers/implementations/checkin.controller";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { requireEventOwner } from "@/middlewares/eventOwner.middleware";
import { USER_ROLES } from "@/constants/user-system.constants";



// repository layers
const checkinRepo       = new CheckinRepository();
const eventRepo         = new EventRepository();


// service layers
const checkinService    = new CheckinService(checkinRepo, eventRepo);


// controller layer
const checkinController = new CheckinController(checkinService);





const checkinRouter = Router({ mergeParams: true }); // mergeParams = carry :eventId from parent router



// All check-in routes require: authenticated + host role + owns this event
checkinRouter.use(authenticate, authorize(USER_ROLES.HOST), requireEventOwner);


checkinRouter.post("/", checkinController.scanQRCode.bind(checkinController));
checkinRouter.get("/attendance", checkinController.getEventAttendance.bind(checkinController));




export default checkinRouter;