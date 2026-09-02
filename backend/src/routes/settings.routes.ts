// backend/src/routes/settings.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { SETTINGS_ROUTES } from "@/constants/routes.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { settingsController } from "@/container/dependencies";





const settingsRouter = Router();



settingsRouter.get(SETTINGS_ROUTES.TERMS, settingsController.getTermsAndConditions);
settingsRouter.get(SETTINGS_ROUTES.OPERATIONAL, authenticate, settingsController.getOperationalSettings);

// Updates the numeric/operational behavior of the platform
settingsRouter.put(SETTINGS_ROUTES.OPERATIONAL, authenticate, authorize(USER_ROLES.ADMIN), settingsController.updateOperationalSettings);
// Updates the string arrays for legal documents and syncs with AI
settingsRouter.put(SETTINGS_ROUTES.TERMS, authenticate, authorize(USER_ROLES.ADMIN), settingsController.updateTerms);






export default settingsRouter;