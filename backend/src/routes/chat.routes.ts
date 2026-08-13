// backend/src/routes/chat.routes.ts
import { Router } from "express";
import { ChatController } from "@/controllers/implementations/chat.controller";
import { ChatService } from "@/services/chat-services/implementations/chat.service";
import { MongoFaqRepository } from "@/repositories/implementations/mongoFaq.repository";
import { authenticate } from "@/middlewares/auth.middleware";
import { GeminiAiChatProvider } from "@/providers/ai-chat-providers/implementations/GeminiChatProvider";
import { CHAT_ROUTES } from "@/constants/routes.constants";
import { GoogleGenAI } from "@google/genai";





// REPOSITORIES ───────────────────────────────────────────────────
const faqRepo = new MongoFaqRepository();
// const vectorRepo = new PgVectorRepository();
// const vectorRepo = new MongoVectorRepository();




// AI CONFIGURATIONS ──────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });




// CHAT PROVIDERS    ──────────────────────────────────────────────
const aiChatProvider = new GeminiAiChatProvider(genAI);



// SERVICES     ───────────────────────────────────────────────────
const chatService = new ChatService(faqRepo, aiChatProvider);



// CONTROLLER   ───────────────────────────────────────────────────
const chatController = new ChatController(chatService);





// ─── Router ───────────────────────────────────────────────────────────────────
const chatRouter = Router();

// Assuming users need to be logged in to chat
// chatRouter.use(authenticate);


chatRouter.post(CHAT_ROUTES.ASK, chatController.askQuestion.bind(chatController));



export default chatRouter;