// src/services/storage-services/implementations/CloudinaryStorageService.ts
import { 
    FileResourceType, 
    IFileStorageService 
} from "../interfaces/IFileStorageService";
import { cloudinary } from "@/config/cloudinary.config";





export class CloudinaryStorageService implements IFileStorageService {
    private readonly projectFolder = 'crowd-connect';

    async uploadFile(fileBuffer: Buffer, folderPath: string, fileType: FileResourceType = 'image'): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: `${this.projectFolder}/${folderPath}`, 
                    resource_type: fileType 
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error("Cloudinary upload failed"));
                    resolve(result.secure_url);
                }
            );
            
            // Write the buffer to the stream
            uploadStream.end(fileBuffer);
        });
    }


    // for uploading AI genenated image to cloudinary
    async uploadBase64(base64Data: string, folderPath: string): Promise<string> {
        // base64Data may come with a data URI prefix — strip it if present
        const data = base64Data.startsWith("data:") 
            ? base64Data 
            : `data:image/png;base64,${base64Data}`;

        const result = await cloudinary.uploader.upload(data, {
            folder: folderPath,
            resource_type: "image",
        });

        return result.secure_url;
    }



    async deleteFile(fileUrl: string, resourceType: FileResourceType = 'image'): Promise<void> {
        try {
            const publicId = this.extractPublicIdFromUrl(fileUrl);
            if (!publicId) return;

            const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            if (result.result !== 'ok') {
                console.warn(`Cloudinary delete warning: ${result.result} for ID: ${publicId}`);
            }

        } catch (error) {
            console.error("Cloudinary deletion error:", error);
            throw error;
        }
    }



    private extractPublicIdFromUrl(url: string): string | null {
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
            console.error("Error extracting ID:", error);
            return null;
        }
    }
}