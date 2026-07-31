// backend/src/providers/ai-image-providers/interfaces/IAiImageProvider.ts

export interface IAiImageProvider {
    generateImage(prompt: string): Promise<string>;
}