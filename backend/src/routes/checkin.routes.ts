// backend/src/routes/checkin.routes.ts

import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { requireEventOwner } from "@/middlewares/eventOwner.middleware";
import { USER_ROLES } from "@/constants/user-system.constants";
import { CHECKIN_ROUTES } from "@/constants/routes.constants";
import { checkinController } from "@/container/dependencies";






const checkinRouter = Router({ mergeParams: true }); // mergeParams = carry :eventId from parent router



// All check-in routes require: authenticated + host role + owns this event
checkinRouter.use(authenticate, authorize(USER_ROLES.HOST), requireEventOwner);


checkinRouter.post(CHECKIN_ROUTES.QR_SCAN, checkinController.scanQRCode.bind(checkinController));
checkinRouter.get(CHECKIN_ROUTES.ATTENDEES, checkinController.getEventAttendance.bind(checkinController));




export default checkinRouter;