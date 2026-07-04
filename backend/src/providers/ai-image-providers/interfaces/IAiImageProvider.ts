// backend/src/interfaces/IAiImageProvider.ts

export interface IAiImageProvider {
    generateImage(prompt: string): Promise<string>;
}