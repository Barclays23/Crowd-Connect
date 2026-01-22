// src/config/aws-s3.config.ts

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";



dotenv.config();



const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});


const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;


// 1. UPLOAD: Returns the Key (File Path) to store in DB
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



// 2. GET URL: Generates a temporary secure link (valid for 1 hour)
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




// 3. DELETE: Removes file from bucket
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












    // async updateProfilePicture(currentUserId: string, imageFile?: Express.Multer.File): Promise<UserProfileResponseDto> {
    //     try {
    //         // console.log('✅ currentUserId received in UserProfileService.updateProfilePicture:', currentUserId);
    //         // console.log('✅ imageFile received in UserProfileService.updateProfilePicture:', imageFile);

    //         const currentUser: UserEntity | null = await this._userRepository.getUserById(currentUserId);

    //         if (!currentUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

    //         if (currentUser.status === UserStatus.BLOCKED) {
    //             throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
    //         }

    //         let newProfilePicKey: string | undefined;
    //         const oldProfilePicKey = currentUser.profilePic;

    //         if (imageFile) {
    //             newProfilePicKey = await uploadToS3(imageFile, 'user-profile-pics');
    //             console.log('✅ New S3 Key generated:', newProfilePicKey);
    //         }

    //         // Update Database only with the new KEY
    //         const profilPicInput = { profilePic: newProfilePicKey };
            
    //         const updatedUserResult: UserEntity = await this._userRepository.updateProfilePicture(currentUserId, profilPicInput);

    //         if (imageFile && oldProfilePicKey) {
    //             deleteFromS3(oldProfilePicKey).catch(err => 
    //                 console.error("Background profile pic delete failed:", err)
    //             );
    //         }

    //         const updatedProfileDto: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);
            
    //         // The frontend needs a secured viewable link, not a database key.
    //         if (updatedProfileDto.profilePic) {
    //             updatedProfileDto.profilePic = await getS3PresignedUrl(updatedProfileDto.profilePic);
    //         }

    //         return updatedProfileDto;

    //     } catch (err: any) {
    //         console.error('Error in UserProfileService.updateProfilePicture:', err);
    //         throw err;
    //     }
    // }