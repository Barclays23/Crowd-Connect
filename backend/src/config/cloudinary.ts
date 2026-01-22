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




export const deleteFromCloudinary = async ({fileUrl, resourceType}: {
    fileUrl: string,
    resourceType: ResourceType
}): Promise<void> => {
    try {
        const publicId = extractPublicIdFromUrl(fileUrl);
        if (!publicId) return;

        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

        if (result.result !== 'ok') {
            console.warn(`Cloudinary delete warning: ${result.result} for ID: ${publicId}`);
        } else {
            console.log(`Deleted resource from Cloudinary with public ID: ${publicId}`);
        }

    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        throw error;
    }
};








// EXAMPLE FUNCTION USAGE:
    // let profilePicUrl: string | undefined;

    // // if (isRemoved) profilePicUrl = '';
    // // if profile pic is removed, pass the isRemoved flag and replace with empty string (will implement later)

    // if uploaded an image
    // if (imageFile){
    //     profilePicUrl = await uploadToCloudinary({
    //         fileBuffer: imageFile.buffer,
    //         folderPath: 'user-profile-pics',
    //         fileType: 'image',
    //     });

    //     console.log('new profilePicUrl:', profilePicUrl);

    //     if (currentUser.profilePic && currentUser.profilePic.trim() !== '') {
    //         try {
    //             await deleteFromCloudinary({fileUrl: currentUser.profilePic, resourceType: 'image'});
    //         } catch (cleanupErr) {
    //             console.warn("Failed to delete user profile pic from Cloudinary:", cleanupErr);
    //         }
    //     }
    // }

    //  const profilPicInput = {profilePic: profilePicUrl}

    // const updatedUserResult: UserEntity = await this._userRepository.updateProfilePicture(currentUserId, profilPicInput);

    // const updatedProfileDto: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);

    // return updatedProfileDto;