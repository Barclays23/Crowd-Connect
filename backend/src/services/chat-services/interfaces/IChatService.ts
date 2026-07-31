// backend/src/services/chat-services/interfaces/IChatService.ts

import { ChatResponseDTO } from "@/dtos/chat.dto";




export interface IChatService {
    generateAnswer(question: string): Promise<ChatResponseDTO>
}