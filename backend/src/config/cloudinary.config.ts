// backend/src/config/cloudinary.config.ts

import { FileResourceType } from '@/services/file-storage-services/interfaces/IFileStorageService';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';


dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };


export interface UploadOptions {
    fileBuffer: Buffer;
    folderPath: string;  // 'project-name/folder-name'
    fileType: FileResourceType;
}





export const extractPublicIdFromUrl = (url: string): string | null => {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        const publicIdWithExtension = parts.slice(uploadIndex + 1)
            .filter(part => !part.startsWith('v'))
            .join('/');

        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        return publicId;

    } catch (error) {
        console.error("Error extracting public ID from Cloudinary URL:", error);
        return null;
    }
};