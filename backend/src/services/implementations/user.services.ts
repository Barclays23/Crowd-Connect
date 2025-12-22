// backend/src/services/implementations/user.services.ts

import { IUserServices } from "../interfaces/IUserServices";
import { UserRepository } from "../../repositories/implementations/user.repository";
import { 
    CreateUserDTO, 
    UserProfileDto
} from "../../dtos/user.dto";

import { createHttpError } from "../../utils/httpError.utils";
import User, { IUser, IUserModel } from "../../models/implementations/user.model";
import { hashPassword } from "../../utils/bcrypt.utils";
import { mapCreateUserDTOToEntity } from "../../mappers/user.mapper";
import { CreateUserEntity, UserEntity } from "src/entities/user.entity";
import { GetUsersFilter, GetUsersResult } from "../../types/user.types";



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

            // Get total count and paginated users in parallel
            const [users, totalCount]: [UserEntity[] | null, number] = await Promise.all([
                this._userRepository.findUsers(query, skip, limit),
                this._userRepository.countUsers(query)
            ]);


            // console.log('✅  Users fetched from DB in userServices.getAllUsers:', users.length);
            // console.log('✅  Total users count in userServices.getAllUsers:', totalCount);

            const mappedUsers: UserProfileDto[] | null = users ? users.map(user => ({
                userId: String(user.id),
                name: user.name,
                email: user.email,
                mobile: user?.mobile,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isMobileVerified: user.isMobileVerified,
                status: user.status,
                profilePic: user?.profilePic,
                createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
            })) : null;

            
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




    async createUserByAdmin(userDto: CreateUserDTO): Promise<string> {
        try {
            const existingUser = await this._userRepository.findUserByEmail(userDto.email);
            if (existingUser) {
                throw createHttpError(400, 'User with this email already exists.');
            }

            const tempPassword = 'Temp@1234'; // temporary password, should be changed later
            const hashedPassword = await hashPassword(tempPassword);

            const userEntity: CreateUserEntity = mapCreateUserDTOToEntity(userDto, hashedPassword);

            const newUser = await this._userRepository.createUserByAdmin(userEntity);
            if (!newUser) {
                throw createHttpError(500, 'Failed to create user.');
            }

            // send email to user with temp password and instructions to change it
            // (email sending logic not implemented here)

            
            return 'User created successfully.';
            
        } catch (err: any) {
            console.error('Error in userServices.createUserByAdmin:', err);
            throw createHttpError(500, 'Failed to create user.');
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