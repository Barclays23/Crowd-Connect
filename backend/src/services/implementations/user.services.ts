// backend/src/services/implementations/user.services.ts

import { IUserServices } from "../interfaces/IUserServices";
import { UserRepository } from "../../repositories/implementations/user.repository";
import { 
    CreateUserDTO, 
    UpdateUserDTO, 
    UserProfileDto
} from "../../dtos/user.dto";

import { createHttpError } from "../../utils/httpError.utils";
import User, { IUser, IUserModel } from "../../models/implementations/user.model";
import { hashPassword } from "../../utils/bcrypt.utils";

import { 
    mapCreateUserDTOToEntity, 
    mapUpdateUserDTOToEntity, 
    mapUserEntityToUserProfileDto 
} from "../../mappers/user.mapper";

import { CreateUserEntity, UpdateUserEntity, UserEntity } from "../../entities/user.entity";
import { GetUsersFilter, GetUsersResult } from "../../types/user.types";
import { uploadToCloudinary } from "../../config/cloudinary";
import { HttpResponse } from "../../constants/responseMessages";
import { HttpStatus } from "../../constants/statusCodes";



export class UserServices implements IUserServices {
    constructor(private _userRepository: UserRepository) {
    }
  

    // get all users (admin)
    async getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult> {
        try {
            // console.log('Query received in userServices.getAllUsers:', filters);
            const { page, limit, search, role, status } = filters;

            const query: any = {};

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } },
                ];
            }
            if (role) query.role = role;
            if (status) query.status = status;

            const skip = (page - 1) * limit;

            const [users, totalCount]: [UserEntity[] | null, number] = await Promise.all([
                this._userRepository.findUsers(query, skip, limit),
                this._userRepository.countUsers(query)
            ]);

            const mappedUsers: UserProfileDto[] = users ? users.map(mapUserEntityToUserProfileDto) : [];

            return {
                users: mappedUsers, // not included host details (organisationName, address, certificates etc)
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            };

        } catch (err: any) {
            console.error('Error in userServices.getAllUsers:', err);
            throw createHttpError(500, 'Failed to fetch users.');
        }
    }




    async createUserByAdmin({createDto, imageFile}: {
        createDto: CreateUserDTO, 
        imageFile?: Express.Multer.File
    }): Promise<UserProfileDto> {
        try {
            const existingEmailUser: UserEntity | null = await this._userRepository.findUserByEmail(createDto.email);
            if (existingEmailUser) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.EMAIL_EXIST);
            }

            const existingMobileUser: UserEntity | null = createDto.mobile ? await this._userRepository.findUserByMobile(createDto.mobile) : null;
            if (existingMobileUser) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.MOBILE_EXIST);
            }

            const tempPassword = 'Temp@1234'; // temporary password, should be changed later
            const hashedPassword = await hashPassword(tempPassword);

            let profilePicUrl: string = '';

            if (imageFile) {
                profilePicUrl = await uploadToCloudinary({
                    fileBuffer: imageFile.buffer,
                    folderPath: 'user-profile-pics',
                    fileType: 'image',
                });
            }

            const userEntity: CreateUserEntity = mapCreateUserDTOToEntity({createDto, profilePicUrl, hashedPassword});

            const createdUserResult: UserEntity = await this._userRepository.createUserByAdmin(userEntity);
            if (!createdUserResult) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.FAILED_CREATE_USER);
            }

            const newUser: UserProfileDto = mapUserEntityToUserProfileDto(createdUserResult);
            
            // send email to user with temp password and instructions to change it
            // (email sending logic not implemented here)

            return newUser;

            
        } catch (err: any) {
            console.error('Error in userServices.createUserByAdmin:', err);
            throw err;
        }
    }




    async editUserByAdmin({userId, updateDto, imageFile}: {
        userId: string, 
        updateDto: UpdateUserDTO, 
        imageFile?: Express.Multer.File
    }): Promise<UserProfileDto> {
        try {
            // console.log('✅ userId received in userServices.editUserByAdmin:', userId);
            // console.log('✅ updateDto received in userServices.editUserByAdmin:', updateDto);
            // console.log('✅ imageFile received in userServices.editUserByAdmin:', imageFile);
            
            const existingUser: UserEntity | null = await this._userRepository.findUserById(userId);

            if (!existingUser) {
                throw createHttpError(404, 'User not found.');
            }

            const existingMobileUser: UserEntity | null = updateDto.mobile ? await this._userRepository.findUserByMobile(updateDto.mobile) : null;
            if (existingMobileUser && existingMobileUser.id !== userId) {
                throw createHttpError(400, 'Another user with this mobile number already exists.');
            }

            let profilePicUrl: string | undefined= existingUser.profilePic;

            if (imageFile){
                profilePicUrl = await uploadToCloudinary({
                    fileBuffer: imageFile.buffer,
                    folderPath: 'user-profile-pics',
                    fileType: 'image',
                });

                console.log('new profilePicUrl:', profilePicUrl);

                // delete old profile pic from cloudinary if needed
            }


            const updateEntity: UpdateUserEntity = mapUpdateUserDTOToEntity({updateDto, profilePicUrl});
            
            const updatedUserResult: UserEntity = await this._userRepository.updateUserByAdmin(userId, updateEntity);

            const updatedUser: UserProfileDto = mapUserEntityToUserProfileDto(updatedUserResult);

            return updatedUser;

        } catch (err: any) {
            console.error('Error in userServices.editUserByAdmin:', err);
            throw err;
        }
    }




    // async updateProfile(user: UserDto): Promise<string> {
    //     try {
    //         const userData = await this._userRepository.findUserByEmail(user.email) as ... | null;
    //         if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND)

    //         // const hashedPassword = await hashPassword(user.password);

    //         const RedisRegisterData = await redisClient.get(user.email);
    //         if (RedisRegisterData) {
    //             const parsedData = JSON.parse(RedisRegisterData);
    //             console.log("Redis Data For Registration:", parsedData);
    //         }


    //         if (!response) {
    //             throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.INTERNAL_SERVER_ERROR);
    //         }

    //         // return user email for verification step (/verify-account)
    //         return user.email

    //     } catch (error) {
    //         console.error("Error in AuthServices.signUp:", error);
    //         throw error;
    //     }
    // }






}