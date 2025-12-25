// backend/src/mappers/user.mapper.ts
import { CreateUserDTO, HostDto, UpdateUserDTO, UserProfileDto } from "../dtos/user.dto";
import { AuthUserDto, SignUpRequestDto } from "../dtos/auth.dto";

import { 
   UserEntity,
   CreateUserEntity, 
   SensitiveUserEntity, 
   SignUpUserEntity, 
   UpdateUserEntity,
   HostEntity, 
} from "../entities/user.entity";

import User, { IUserModel } from "../models/implementations/user.model";






// ------------------------------- MODEL to ENTITY ---------------------------------


// UserModel to UserEntity (without password)
export const mapUserModelToUserEntity = (user: IUserModel): UserEntity => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
//   password: user.password,
  role: user.role,
  status: user.status,
  mobile: user.mobile,
  profilePic: user.profilePic,
  isEmailVerified: user.isEmailVerified,
  isMobileVerified: user.isMobileVerified,
  createdAt: user.createdAt
});



// UserModel to SensitiveUserEntity
// for internal auth purpose (login, verify-otp, reset password etc) + sending user data to frontend without password
export const mapUserModelToSensitiveUserEntity = (user: IUserModel): SensitiveUserEntity => ({
   id: user._id.toString(),
   name: user.name,
   email: user.email,
   password: user.password,
   role: user.role,
   status: user.status,
   mobile: user.mobile,
   profilePic: user.profilePic,
   isEmailVerified: user.isEmailVerified,
   isMobileVerified: user.isMobileVerified,
});







// ------------------------------- ENTITY to DTO ---------------------------------


// UserEntity to AuthUserDto (for auth responses: login, verify-otp etc)
export const mapUserEntityToAuthUserDto = (
  entity: UserEntity
): AuthUserDto => ({
  userId: entity.id.toString(),
  name: entity.name,
  email: entity.email,
  role: entity.role,
  status: entity.status,
//   mobile: entity?.mobile,
  profilePic: entity.profilePic ?? undefined,
  isEmailVerified: entity.isEmailVerified,
});





// UserEntity to UserProfileDto (for profile response)
export const mapUserEntityToUserProfileDto = (
   entity: UserEntity
): UserProfileDto => {
   return {
      userId: String(entity.id),
      name: entity.name,
      email: entity.email,
      role: entity.role,
      status: entity.status,
      // mobile: user?.mobile,
      // profilePic: user?.profilePic,
      mobile: entity.mobile ?? null,
      profilePic: entity.profilePic ?? null,
      isEmailVerified: entity.isEmailVerified,
      isMobileVerified: entity.isMobileVerified,
      // createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt),
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : null,
   }
};






// UserEntity to HostDto (for profile response if role === 'host')
export const mapHostEntityToHostDto = (entity: HostEntity): HostDto => {
   
   const baseProfile = mapUserEntityToUserProfileDto(entity);

   return {
      ...baseProfile,
      organizationName: entity.organisationName ?? null,
      registrationNumber: null, // Add to entity if needed later
      businessAddress: entity.address ?? null,
      certificate: null, // Add to entity if needed later
   };
};








// ------------------------------- DTO to ENTITY ---------------------------------




// SignUpRequestDto to SignUpUserEntity (for user registration after verifying otp)
export const mapSignUpDtoToSignUpUserEntity = (
   dto: SignUpRequestDto,
): SignUpUserEntity => ({
   name: dto.name,
   email: dto.email,
   password: dto.password,
   isEmailVerified: true,  // since otp is already verified
});




// CreateUserDTO to CreateUserEntity (to create new user by admin)
export const mapCreateUserDTOToEntity = ({ createDto, profilePicUrl, hashedPassword}: {
   createDto: CreateUserDTO;
   profilePicUrl?: string;
   hashedPassword: string;
}): CreateUserEntity => {
   const entity: CreateUserEntity = {
      name: createDto.name,
      email: createDto.email,
      password: hashedPassword,
      role: createDto.role,
      status: createDto.status ?? "pending",
      mobile: createDto.mobile,
      profilePic: profilePicUrl,
      isEmailVerified: false,
      isMobileVerified: false,
   };

   return entity;
};





// UpdateUserDTO to UpdateUserEntity (to update user by admin)
// export const mapUpdateUserDTOToEntity = (
//    dto: UpdateUserDTO
// ): UpdateUserEntity => {
//    const entity: UpdateUserEntity = {};

//    if (dto.name !== null && dto.name !== undefined)
//       entity.name = dto.name;

//    if (dto.email !== null && dto.email !== undefined)
//       entity.email = dto.email;

//    if (dto.role !== null && dto.role !== undefined)
//       entity.role = dto.role;

//    if (dto.status !== null && dto.status !== undefined)
//       entity.status = dto.status;

//    if (dto.mobile !== null && dto.mobile !== undefined)
//       entity.mobile = dto.mobile;

//    if (dto.profilePic !== null && dto.profilePic !== undefined)
//       entity.profilePic = dto.profilePic;

//    return entity;
// };



export const mapUpdateUserDTOToEntity = ({updateDto, profilePicUrl}: {
   updateDto: UpdateUserDTO,
   profilePicUrl?: string
}): UpdateUserEntity => {
   const entity: UpdateUserEntity = {};

   if (updateDto.name !== undefined) entity.name = updateDto.name;
   if (updateDto.email !== undefined) entity.email = updateDto.email;
   if (updateDto.role !== undefined) entity.role = updateDto.role;
   if (updateDto.status !== undefined) entity.status = updateDto.status;
   if (updateDto.mobile !== undefined) entity.mobile = updateDto.mobile;
   if (profilePicUrl !== undefined) entity.profilePic = profilePicUrl;

   return entity;
};









// testing purpose (change function name if needed)
// export const mapUserToResponseDto = (user: any): UserResponseDTO => {
//    return {
//       id: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       role: user.role,
//    };
// };
