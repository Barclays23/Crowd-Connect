// backend/src/routes/ai.routes.ts
import { Router } from 'express';
import { validateRequest } from '@/middlewares/validate.middleware';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { AiService } from '@/services/ai-services/implementations/ai.service';
import { AiController } from '@/controllers/implementations/ai.controller';
import { GeneratePosterSchema } from '@/schemas/ai.schema';
import { USER_ROLES } from '@/constants/user-system.constants';
import { AI_ROUTES } from '@/constants/routes.constants';
import { OpenAiImageProvider } from '@/providers/ai-image-providers/implementations/OpenAiImageProvider';
import { GeminiImageProvider } from '@/providers/ai-image-providers/implementations/GeminiImageProvider';
// import { GoogleGenerativeAI } from "@google/generative-ai";  // this legacy SDK will depricate soon
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { PollinationsImageProvider } from '@/providers/ai-image-providers/implementations/PollinationsImageProvider';
import { FalImageProvider } from '@/providers/ai-image-providers/implementations/FalImageProvider';
import { HuggingFaceImageProvider } from '@/providers/ai-image-providers/implementations/HuggingFaceImageProvider';




// const GenerativeAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
// const genAI         = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
// const openAI        = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });




// PROVIDERS
// const aiImageProvider   = new GeminiImageProvider(genAI);
// const aiImageProvider   = new OpenAiImageProvider(openAI);
const aiImageProvider   = new PollinationsImageProvider();
// const aiImageProvider   = new FalImageProvider();  // Fal/Flux provider ($0.004/mega pixel)
// const aiImageProvider   = new HuggingFaceImageProvider();



// SERVICES
const aiService         = new AiService(aiImageProvider);




// CONTROLLER
const aiController = new AiController(aiService);



const aiRouter = Router();



aiRouter.post(
    AI_ROUTES.GENERATE_EVENT_POSTER,
    authenticate, authorize(USER_ROLES.HOST, USER_ROLES.ADMIN),
    validateRequest({ body: GeneratePosterSchema }),
    aiController.generateEventPoster.bind(aiController)
);





export default aiRouter;