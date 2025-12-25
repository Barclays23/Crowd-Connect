import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

type ResourceType = 'image' | 'video' | 'raw' | 'auto' | undefined;

export interface UploadOptions {
    fileBuffer: Buffer;
    folderPath: string;  // 'project-name/folder-name'
    fileType: ResourceType;
}

const projectFolder = 'crowd-connect';



export const uploadToCloudinary = ({
    fileBuffer,
    folderPath,
    fileType,
}: UploadOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
        { 
            folder: `${projectFolder}/${folderPath}`, 
            resource_type: fileType 
        },
        (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Cloudinary upload failed"));
            resolve(result.secure_url);
            console.log("cloudinary upload result: ", result);
        }
        );
        // Write the buffer to the stream
        uploadStream.end(fileBuffer);
    });
};




export const deleteFromCloudinary = async (publicId: string, resourceType: ResourceType): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`Deleted resource from Cloudinary with public ID: ${publicId}`);
    } catch (error) {
        throw error;
    }
};