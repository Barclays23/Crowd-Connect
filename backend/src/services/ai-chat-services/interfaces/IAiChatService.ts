// backend/src/services/ai-chat-services/interfaces/IAiChatService.ts

import { ChatResponseDTO } from "@/dtos/chat.dto";




export interface IAiChatService {
    generateAnswer(question: string): Promise<ChatResponseDTO>
}