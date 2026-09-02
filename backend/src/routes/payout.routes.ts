// backend/src/routes/payout.routes.ts  (Host routes)
import { Router } from "express";
import { USER_ROLES } from "@/constants/user-system.constants";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { PAYOUT_ROUTES } from "@/constants/routes.constants";
import { uploadPayoutProof } from "@/middlewares/file-upload.middleware";
import { EventIdParamSchema } from "@/schemas/mongo.schema";
import { validateParams } from "@/middlewares/validate.middleware";
import { payoutController } from "@/container/dependencies";




const payoutRouter = Router();

// middleware
payoutRouter.use(authenticate, authorize(USER_ROLES.HOST));



payoutRouter.get(PAYOUT_ROUTES.ELIGIBLE_EVENTS, payoutController.getEligibleEvents.bind(payoutController));

payoutRouter.post(
    PAYOUT_ROUTES.REQUEST_PAYOUT, 
    uploadPayoutProof.array("payout-proofs", 3),
    validateParams(EventIdParamSchema), 
    payoutController.requestPayout.bind(payoutController)  
);

payoutRouter.get(PAYOUT_ROUTES.MY_PAYOUTS, payoutController.getMyPayouts.bind(payoutController));



export default payoutRouter;