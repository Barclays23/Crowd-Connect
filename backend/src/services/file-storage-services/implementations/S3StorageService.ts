// src/services/storage-services/implementations/S3StorageService.ts
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { FileResourceType, IFileStorageService } from "../interfaces/IFileStorageService";
import { randomBytes } from "crypto";
import { s3Client, BUCKET_NAME, AWS_REGION } from "@/config/aws-s3.config";




export class S3StorageService implements IFileStorageService {

    async uploadFile(fileBuffer: Buffer, folderPath: string, fileType: FileResourceType = 'image'): Promise<string> {
        const uniqueSuffix = randomBytes(8).toString("hex");
        const fileName = `${folderPath}/${Date.now()}-${uniqueSuffix}`;
        
        const contentType = fileType === 'image' ? 'image/jpeg' : 'application/octet-stream';

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await s3Client.send(command);
        
        return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    }


    async uploadBase64(base64Data: string, folderPath: string): Promise<string> {
        const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const fileBuffer = Buffer.from(base64Content, 'base64');

        return this.uploadFile(fileBuffer, folderPath, 'image');
    }
    

    // async deleteFile(fileUrl: string, resourceType: FileResourceType = 'image'): Promise<void> {
    async deleteFile(fileUrl: string): Promise<void> {
        try {
            if (!fileUrl.includes('amazonaws.com')) return;
            
            const urlObj = new URL(fileUrl);
            const fileKey = decodeURIComponent(urlObj.pathname.substring(1));

            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileKey,
            });

            await s3Client.send(command);

        } catch (error: unknown) {
            console.error("S3 deletion error:", error);
        }
    }
}