// backend/src/routes/host.routes.ts
import { Router } from "express";
import { uploadDocument, uploadImage } from "@/middlewares/file-upload.middleware";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate.middleware";
import { HostUpgradeSchema } from "@/schemas/host.schema";
import { HOST_ROUTES } from "@/constants/routes.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { hostController } from "@/container/dependencies";






const hostRouter = Router();


hostRouter.post(HOST_ROUTES.APPLY_UPGRADE, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST), 
    // uploadDocument.single('hostDocument'),
    uploadDocument.fields([
        { name: 'hostDocument', maxCount: 1 }, 
        { name: 'organizationLogo', maxCount: 1 }
    ]),
    validateRequest({body: HostUpgradeSchema}), 
    hostController.applyHostRoleUpgrade.bind(hostController)
);

hostRouter.patch(HOST_ROUTES.ORGANIZER_DETAILS, authenticate, authorize(USER_ROLES.HOST), uploadDocument.single('hostDocument'), hostController.updateHostDetailsByHost.bind(hostController));

hostRouter.patch(HOST_ROUTES.ORGANIZER_LOGO, authenticate,authorize(USER_ROLES.HOST),uploadImage.single('organizationLogo'),hostController.updateHostLogoByHost.bind(hostController));

// Public route for fetching Organiser Profile
hostRouter.get(HOST_ROUTES.ORGANISER_PROFILE, hostController.getOrganiserProfile.bind(hostController));





export default hostRouter;