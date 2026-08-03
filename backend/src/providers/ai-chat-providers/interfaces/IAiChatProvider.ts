// backend/src/providers/ai-chat-providers/interfaces/IAiChatProvider.ts


export interface IAiChatProvider {
  createEmbedding(userText: string): Promise<number[]>;
  generateAnswer(prompt: string): Promise<string>;
}