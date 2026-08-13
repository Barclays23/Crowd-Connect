// backend/src/routes/settings.routes.ts

import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { SETTINGS_ROUTES } from "@/constants/routes.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { PlatformSettingsController } from "@/controllers/implementations/platformSettings.controller";
import { PlatformSettingsService } from "@/services/platform-settings-services/implementations/platformSettings.service";
import { PlatformSettingsRepository } from "@/repositories/implementations/platformSettings.repository";
import { GeminiAiChatProvider } from "@/providers/ai-chat-providers/implementations/GeminiChatProvider";
import { FaqIngestionService } from "@/services/chat-services/implementations/faqIngestion.service";
import { MongoFaqRepository } from "@/repositories/implementations/mongoFaq.repository";
import { GoogleGenAI } from "@google/genai";



// REPOS
const settingsRepo          = new PlatformSettingsRepository();
const faqKnowledgeRepo      = new MongoFaqRepository();  //  which ever the FaqKnowledgeRepository used




// AI CONFIGURATIONS ──────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



// PROVIDERS
const aiChatProvider            = new GeminiAiChatProvider(genAI);   // which ever the AI chat provider used


// SERVICES
const faqIngestionService   = new FaqIngestionService(faqKnowledgeRepo, aiChatProvider);
const settingsService       = new PlatformSettingsService(settingsRepo, faqIngestionService);


// CONTROLLER
const settingsController    = new PlatformSettingsController(settingsService);



const settingsRouter = Router();



settingsRouter.get(SETTINGS_ROUTES.TERMS, settingsController.getTermsAndConditions);
settingsRouter.get(SETTINGS_ROUTES.OPERATIONAL, authenticate, settingsController.getOperationalSettings);

// Updates the numeric/operational behavior of the platform
settingsRouter.put(SETTINGS_ROUTES.OPERATIONAL, authenticate, authorize(USER_ROLES.ADMIN), settingsController.updateOperationalSettings);
// Updates the string arrays for legal documents and syncs with AI
settingsRouter.put(SETTINGS_ROUTES.TERMS, authenticate, authorize(USER_ROLES.ADMIN), settingsController.updateTerms);






export default settingsRouter;