// backend/src/services/implementations/user.services.ts

import { IUserServices } from "../interfaces/IUserServices";
import { UserRepository } from "../../repositories/implementations/user.repository";
import { 
    CreateUserRequestDto, 
    UpdateUserRequestDto, 
    UserProfileResponseDto,
    HostResponseDto, 
} from "../../dtos/user.dto";

import { createHttpError } from "../../utils/httpError.utils";
import { hashPassword } from "../../utils/bcrypt.utils";

import { 
    mapCreateUserRequestDtoToInput, 
    mapUpdateUserRequestDtoToInput, 
    mapUserEntityToProfileDto
} from "../../mappers/user.mapper";

import { CreateUserInput, HostEntity, UpdateUserInput, UserEntity, UserProfileEntity } from "../../entities/user.entity";
import { GetUsersFilter, GetUsersResult } from "../../types/user.types";
import { uploadToCloudinary } from "../../config/cloudinary";
import { HttpResponse } from "../../constants/responseMessages";
import { HttpStatus } from "../../constants/statusCodes";



export class UserServices implements IUserServices {
    constructor(
        private _userRepository: UserRepository
    ) {}


    async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
        try {
            const userData: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);

            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            const userProfile: UserProfileResponseDto = mapUserEntityToProfileDto(userData);

            return userProfile;

        } catch (error: any) {
            console.error('Error in userServices.getUserProfile:', error);
            throw error;
        }
    }
  

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

            const mappedUsers: UserProfileResponseDto[] = users ? users.map(mapUserEntityToProfileDto) : [];

            return {
                users: mappedUsers, // not included host details (organizationName, address, certificates etc)
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            };

        } catch (err: any) {
            console.error('Error in userServices.getAllUsers:', err);
            throw err;
        }
    }




    async createUserByAdmin({createDto, imageFile}: {
        createDto: CreateUserRequestDto, 
        imageFile?: Express.Multer.File
    }): Promise<UserProfileResponseDto> {
        try {
            const existingEmailUser: UserEntity | null = await this._userRepository.getUserByEmail(createDto.email);
            if (existingEmailUser) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.EMAIL_EXIST);
            }

            const existingMobileUser: UserEntity | null = createDto.mobile ? await this._userRepository.getUserByMobile(createDto.mobile) : null;
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

            const userEntity: CreateUserInput = mapCreateUserRequestDtoToInput({createDto, profilePicUrl, hashedPassword});

            const createdUserResult: UserEntity = await this._userRepository.createUserByAdmin(userEntity);
            if (!createdUserResult) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.FAILED_CREATE_USER);
            }

            const newUser: UserProfileResponseDto = mapUserEntityToProfileDto(createdUserResult);
            
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
        updateDto: UpdateUserRequestDto, 
        imageFile?: Express.Multer.File
    }): Promise<UserProfileResponseDto> {
        try {
            // console.log('✅ userId received in userServices.editUserByAdmin:', userId);
            // console.log('✅ updateDto received in userServices.editUserByAdmin:', updateDto);
            // console.log('✅ imageFile received in userServices.editUserByAdmin:', imageFile);
            
            const existingUser: UserEntity | null = await this._userRepository.getUserById(userId);

            if (!existingUser) {
                throw createHttpError(404, 'User not found.');
            }

            const existingMobileUser: UserEntity | null = updateDto.mobile ? await this._userRepository.getUserByMobile(updateDto.mobile) : null;
            if (existingMobileUser && existingMobileUser.id !== userId) {
                throw createHttpError(400, 'Another user with this mobile number already exists.');
            }

            let profilePicUrl: string | undefined;

            // if (isRemoved) profilePicUrl = '';
            // if profile pic is removed, pass the isRemoved flag and replace with empty string (will implement later)

            if (imageFile){
                profilePicUrl = await uploadToCloudinary({
                    fileBuffer: imageFile.buffer,
                    folderPath: 'user-profile-pics',
                    fileType: 'image',
                });

                console.log('new profilePicUrl:', profilePicUrl);

                // delete old profile pic from cloudinary if needed
            }


            const updateEntity: UpdateUserInput = mapUpdateUserRequestDtoToInput({updateDto, profilePicUrl});
            
            const updatedUserResult: UserEntity = await this._userRepository.updateUserByAdmin(userId, updateEntity);

            const updatedUser: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);

            return updatedUser;

        } catch (err: any) {
            console.error('Error in userServices.editUserByAdmin:', err);
            throw err;
        }
    }




    // async updateProfile(user: UserDto): Promise<string> {
    //     try {
    //         const userData = await this._userRepository.getUserByEmail(user.email) as ... | null;
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