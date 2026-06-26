// backend/src/routes/settings.routes.ts

import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { SETTINGS_ROUTES } from "@/constants/routes.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { PlatformSettingsController } from "@/controllers/implementations/platformSettings.controller";
import { PlatformSettingsService } from "@/services/platform-settings-services/implementations/platformSettings.service";
import { PlatformSettingsRepository } from "@/repositories/implementations/platformSettings.repository";





// REPOS
const settingsRepo          = new PlatformSettingsRepository();


// SERVICES
const settingsService       = new PlatformSettingsService(settingsRepo);


// CONTROLLER
const settingsController    = new PlatformSettingsController(settingsService);



const settingsRouter = Router();


settingsRouter.get(SETTINGS_ROUTES.GET_SETTINGS, authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.HOST), settingsController.getSettings.bind(settingsController));
settingsRouter.put(SETTINGS_ROUTES.UPDATE_SETTINGS, authenticate, authorize(USER_ROLES.ADMIN), settingsController.updateSettings.bind(settingsController));






export default settingsRouter;