// backend/src/config/aws-s3.config.ts
import { 
    S3Client, 
    PutObjectCommand, 
    DeleteObjectCommand, 
    GetObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";


dotenv.config();


export const AWS_REGION = process.env.AWS_REGION as string;
export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;


export const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
    },
});



// UPLOAD: Returns the Key (File Path) to store in DB
export const uploadToS3 = async (file: Express.Multer.File, folderPath: string): Promise<string> => {
    const fileName = `${folderPath}/${Date.now()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3Client.send(command);
    return fileName; 
};



// GET URL: Generates a temporary secure link (valid for 1 hour)
export const getS3PresignedUrl = async (fileKey: string): Promise<string> => {
    try {
        if (!fileKey) return "";
        // Legacy support: if it's already a full URL (from Google/Cloudinary), return it as is
        if (fileKey.startsWith("http")) return fileKey;

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return url;
        
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return "";
    }
};




// DELETE: Removes file from bucket
export const deleteFromS3 = async (fileKey: string): Promise<void> => {
    try {
        if (!fileKey || fileKey.startsWith("http")) return;
        
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(command);
        console.log(`Successfully deleted S3 object: ${fileKey}`);
    } catch (error) {
        console.warn(`Failed to delete S3 object: ${fileKey}`, error);
    }
};