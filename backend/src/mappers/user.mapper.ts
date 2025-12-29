// backend/src/mappers/user.mapper.ts
import { 
   UserProfileDto,
   CreateUserDTO, 
   UpdateUserDTO, 
   HostUpgradeDTO, 
   HostDto, 
} from "../dtos/user.dto";

import { AuthUserDto, SignUpRequestDto } from "../dtos/auth.dto";

import { 
   UserEntity,
   CreateUserEntity, 
   SensitiveUserEntity, 
   SignUpUserEntity, 
   UpdateUserEntity,
   HostEntity,
   UpgradeHostEntity, 
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




export const mapUserModelToHostEntity = (user: IUserModel): HostEntity => {
   const baseProfile: UserEntity = mapUserModelToUserEntity(user);

   return {
      ...baseProfile,
      organizationName: user.organizationName ?? '',
      registrationNumber: user.registrationNumber ?? '',
      businessAddress: user.businessAddress ?? '',
      certificateUrl: user.certificateUrl ?? '',
      hostStatus: user.hostStatus ?? 'pending',
      hostRejectionReason: user.hostRejectionReason ?? '',
      appliedAt: user.hostAppliedAt ?? undefined,
      reviewedAt: user.hostReviewedAt ?? undefined,
   };
};
   









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




// REMOVE THIS (REPLAECED BY mapUserEntityToProfileDto BELOW)
// UserEntity to UserProfileDto (for profile response, excluding host fields) eg: for admin user list
// export const mapUserEntityToUserProfileDto = (
//    entity: UserEntity
// ): UserProfileDto => {
//    return {
//       userId: String(entity.id),
//       name: entity.name,
//       email: entity.email,
//       role: entity.role,
//       status: entity.status,
//       // mobile: entity?.mobile,
//       // profilePic: entity?.profilePic,
//       mobile: entity.mobile ?? undefined,
//       profilePic: entity.profilePic ?? undefined,
//       isEmailVerified: entity.isEmailVerified,
//       isMobileVerified: entity.isMobileVerified,
//       // createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt),
//       createdAt: entity.createdAt ? entity.createdAt.toISOString() : null,
//    }
// };




// mapUserEntityToUserProfileDto


// USER ENTITY to USER PROFILE DTO
export const mapUserEntityToProfileDto = (  // OR mapToUserProfileDto
  entity: UserEntity | HostEntity
): UserProfileDto => {
   const baseProfile: UserProfileDto = {
      userId: String(entity.id),
      name: entity.name,
      email: entity.email,
      role: entity.role,
      status: entity.status,

      mobile: entity.mobile ?? undefined,
      profilePic: entity.profilePic ?? undefined,
      isEmailVerified: entity.isEmailVerified,
      isMobileVerified: entity.isMobileVerified,

      createdAt: entity.createdAt ? entity.createdAt.toISOString() : null,
   };

   // Add host fields only if the entity actually is/was a host
   if (entity.role === "host" || "organizationName" in entity) {
      const host = entity as HostEntity;

      return {
         ...baseProfile,
         organizationName: host.organizationName ?? null,
         registrationNumber: host.registrationNumber ?? null,
         businessAddress: host.businessAddress ?? null,
         certificateUrl: host.certificateUrl ?? null,
         hostStatus: host.hostStatus ?? null,
         hostRejectionReason: host.hostRejectionReason ?? undefined,
      };
   }

  return baseProfile;
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



// only for host upgrade / apply application
export const mapHostUpgradeDTOToEntity = ({upgradeDto, hostDocumentUrl}: {
   upgradeDto: HostUpgradeDTO,
   hostDocumentUrl?: string
}): UpgradeHostEntity => {
   const hostEntity: Partial<HostEntity> = {
      organizationName: upgradeDto.organizationName,
      registrationNumber: upgradeDto.registrationNumber,
      businessAddress: upgradeDto.businessAddress,
      hostStatus: "pending",
   };
   if (hostDocumentUrl !== undefined) hostEntity.certificateUrl = hostDocumentUrl;
   return hostEntity;
}



// to update host details (eg: change host name, regNo, address, document etc) by user or admin
export const mapUpdateHostDTOToEntity = (
   updateDto: HostUpgradeDTO,
   hostDocumentUrl?: string
): UpgradeHostEntity => {
   const entity: UpgradeHostEntity = {};

   if (updateDto.organizationName !== undefined) entity.organizationName = updateDto.organizationName;
   if (updateDto.registrationNumber !== undefined) entity.registrationNumber = updateDto.registrationNumber;
   if (updateDto.businessAddress !== undefined) entity.businessAddress = updateDto.businessAddress;
   if (hostDocumentUrl !== undefined) entity.certificateUrl = hostDocumentUrl;

   return entity;
};