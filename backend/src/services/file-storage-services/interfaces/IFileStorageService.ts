// src/services/storage-services/interfaces/IFileStorageService.ts


export type FileResourceType = 'image' | 'video' | 'raw' | 'auto' | undefined;


export interface IFileStorageService {
    uploadFile(fileBuffer: Buffer, folderPath: string, fileType?: FileResourceType): Promise<string>;
    uploadBase64(base64Data: string, folderPath: string): Promise<string>;
    deleteFile(fileUrl: string, resourceType?: FileResourceType): Promise<void>;
}