// frontend/src/types/chat.types.ts



export interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}



// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface AskQuestionPayload {
  question: string;
}



// ─── Response Payload Types ─────────────────────────────────────────────────────────

export interface IChatResponseState {
  answer: string;
  sources?: string[]; // Optional: if you want to show which rule it used
}