// backend/src/routes/chat.routes.ts
import { Router } from "express";
import { CHAT_ROUTES } from "@/constants/routes.constants";
import { chatController } from "@/container/dependencies";






// ─── Router ───────────────────────────────────────────────────────────────────
const chatRouter = Router();

// Assuming users need to be logged in to chat
// chatRouter.use(authenticate);


chatRouter.post(CHAT_ROUTES.ASK, chatController.askQuestion.bind(chatController));



export default chatRouter;