// backend/src/mappers/user.mapper.ts
import { 
   UserProfileResponseDto,
   CreateUserRequestDto, 
   UpdateUserRequestDto, 
   HostUpgradeRequestDto, 
   BaseUserResponseDto,
   HostManageRequestDto,
   HostStatusUpdateResponseDto, 
} from "../dtos/user.dto.js";

import { AuthUserResponseDto, SignUpRequestDto } from "../dtos/auth.dto.js";


import { 
   SignUpUserInput, 
   CreateUserInput,
   UpdateUserInput,
   UpgradeHostInput, 
   UserEntity, 
   SensitiveUserEntity, 
   HostEntity,
   HostUpdateInput,
   UserProfileEntity,
   HostManageInput,
} from "../entities/user.entity.js";

import { IUserModel } from "../models/implementations/user.model.js";
import { HostStatus, UserRole, UserStatus } from "../constants/roles-and-statuses.js";

const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "";


// ── MODEL → ENTITY ───────────────────────────────────────────────────────────────────────────────



// UserModel to UserEntity (without password)
export const mapUserModelToUserEntity = (doc: IUserModel): UserEntity => ({
   id: doc._id.toString(),
   name: doc.name,
   email: doc.email,
   //   password: doc.password,
   role: doc.role,
   status: doc.status,
   mobile: doc.mobile,
   profilePic: doc.profilePic,
   isEmailVerified: doc.isEmailVerified,
   isMobileVerified: doc.isMobileVerified,
   isSuperAdmin: doc.isSuperAdmin,
   createdAt: doc.createdAt
});



// UserModel to SensitiveUserEntity (for internal auth purpose (login, verify-otp, reset password etc) + sending user data to frontend without password)
export const mapUserModelToSensitiveUserEntity = (doc: IUserModel): SensitiveUserEntity => {
   const baseProfile: UserEntity = mapUserModelToUserEntity(doc);
   return {
      ...baseProfile,
      password: doc.password,
   };
}




export const mapUserModelToHostEntity = (doc: IUserModel): HostEntity => {
   const baseProfile: UserEntity = mapUserModelToUserEntity(doc);

   return {
      ...baseProfile,
      organizationName: doc.organizationName ?? '',
      registrationNumber: doc.registrationNumber ?? '',
      businessAddress: doc.businessAddress ?? '',
      certificateUrl: doc.certificateUrl ?? '',
      hostStatus: doc.hostStatus ?? HostStatus.PENDING,
      appliedAt: doc.hostAppliedAt ?? undefined,
      reviewedAt: doc.hostReviewedAt ?? undefined,
      hostRejectionReason: doc.hostRejectionReason ?? undefined,
      
      // certificateUrl: doc.certificateUrl,
      // hostRejectionReason: doc.hostRejectionReason,
      // appliedAt: doc.hostAppliedAt,
      // reviewedAt: doc.hostReviewedAt,
   };
};




export const mapUserModelToProfileEntity = (doc: IUserModel): UserProfileEntity => {
   const baseProfile: UserEntity = mapUserModelToUserEntity(doc);
   const hostEntity: HostEntity = mapUserModelToHostEntity(doc);

   return {
      ...baseProfile,
      ...hostEntity,
   };
};
   








// ── ENTITY → DTO ─────────────────────────────────────────────────────────────────────────────────



// UserEntity to AuthUserResponseDto (for auth responses: login, verify-otp etc)
export const mapUserEntityToAuthUserDto = (entity: UserEntity): AuthUserResponseDto => ({
   userId: entity.id.toString(),
   name: entity.name,
   email: entity.email,
   role: entity.role,
   status: entity.status,
   // mobile: entity?.mobile,
   mobile: entity.mobile,
   profilePic: entity.profilePic ?? undefined,
   isEmailVerified: entity.isEmailVerified,
   isSuperAdmin: entity.isSuperAdmin,
});








// USER ENTITY to USER PROFILE DTO  (Need only UserProfileEntity as parameter ??)
export const mapUserEntityToProfileDto = (entity: UserEntity | HostEntity | UserProfileEntity): UserProfileResponseDto => {
   const baseProfile: BaseUserResponseDto = {
      userId: String(entity.id),
      name: entity.name,
      email: entity.email,
      role: entity.role,
      status: entity.status,

      // mobile: entity.mobile ?? undefined,
      // profilePic: entity.profilePic ?? undefined,
      mobile: entity.mobile,
      profilePic: entity.profilePic,
      isEmailVerified: entity.isEmailVerified,
      isMobileVerified: entity.isMobileVerified,
      isSuperAdmin: entity.isSuperAdmin,

      createdAt: entity.createdAt ? entity.createdAt.toISOString() : null,  // ?
   };

   // Add host fields only if the entity actually is/was a host
   if (entity.role === "host") {
      const host = entity as HostEntity;

      const hostProfile: UserProfileResponseDto = {
         ...baseProfile,
         organizationName: host.organizationName ?? null,
         registrationNumber: host.registrationNumber ?? null,
         businessAddress: host.businessAddress ?? null,
         certificateUrl: host.certificateUrl ?? null,
         hostStatus: host.hostStatus ?? null,
         hostAppliedAt: host.appliedAt ? host.appliedAt.toISOString() : null,
         hostRejectionReason: host.hostRejectionReason ?? undefined,
      };

      return hostProfile;
   }

   return baseProfile;
};




// HOST ENTITY to HostStatusUpdateResponse DTO
export const mapToHostStatusUpdateResponseDto = (
   host: HostEntity
): HostStatusUpdateResponseDto => {
   return {
      hostId: host.id,
      hostStatus: host.hostStatus,
      hostReviewedAt: host.reviewedAt,
      hostRejectionReason: host.hostRejectionReason,
      // hostBlockReason: host.hostBlockReason,
   };
};




// ── DTO → INPUT ────────────────────────────────────────────────────────────────────────────────────





// SignUpRequestDto to SignUpUserInput (for user registration after verifying otp)
export const mapSignUpRequestDtoToInput = (dto: SignUpRequestDto): SignUpUserInput => ({
   name: dto.name,
   email: dto.email,
   password: dto.password,
   isEmailVerified: true,  // since otp is already verified
   status: UserStatus.ACTIVE,  // set status to "active" upon signup
   role: superAdminEmail === dto.email ? UserRole.ADMIN : UserRole.USER,
   isSuperAdmin: superAdminEmail === dto.email ? true : false,
});




// CreateUserRequestDto to CreateUserInput (to create new user by admin)
export const mapCreateUserRequestDtoToInput = ({ createDto, hashedPassword, profilePicUrl}: {
   createDto: CreateUserRequestDto;
   hashedPassword: string;
   profilePicUrl?: string;
}): CreateUserInput => {
   return {
      name: createDto.name,
      email: createDto.email,
      password: hashedPassword,
      role: createDto.role,
      // status: createDto.status ?? UserStatus.PENDING,
      status: UserStatus.PENDING,  // setting the status as 'PENDING' while creating - status will be changed to ACTIVE once the user is logged in
      mobile: createDto.mobile,
      profilePic: profilePicUrl,
      isEmailVerified: false,
      isMobileVerified: false,
   };
};





// UpdateUserRequestDto to UpdateUserInput (to update user by admin)
export const mapUpdateUserRequestDtoToInput = ({updateDto, profilePicUrl}: {
   updateDto: UpdateUserRequestDto,
   profilePicUrl?: string
}): UpdateUserInput => {
   const userInput: UpdateUserInput = {};

   if (updateDto.name !== undefined) userInput.name = updateDto.name;
   if (updateDto.email !== undefined) userInput.email = updateDto.email;
   if (updateDto.role !== undefined) userInput.role = updateDto.role;
   // if (updateDto.status !== undefined) userInput.status = updateDto.status;  // cannot change - handled separately (eg: block/unblock)
   // if (updateDto.mobile !== undefined) userInput.mobile = updateDto.mobile ?? '';
   if (updateDto.mobile !== undefined) {
      userInput.mobile = (updateDto.mobile === '' || updateDto.mobile === null) 
         ? null 
         : updateDto.mobile;
   }
   if (profilePicUrl !== undefined) userInput.profilePic = profilePicUrl;

   return userInput;
};



// only for host upgrade / apply application
// export const mapHostUpgradeRequestDtoToInput = ({upgradeDto, hostDocumentUrl}: {
//    upgradeDto: HostUpgradeRequestDto,
//    hostDocumentUrl?: string
// }): UpgradeHostInput => {
//    const hostEntity: Partial<HostEntity> = {
//       organizationName: upgradeDto.organizationName,
//       registrationNumber: upgradeDto.registrationNumber,
//       businessAddress: upgradeDto.businessAddress,
//       hostStatus: "pending",
//    };
//    if (hostDocumentUrl !== undefined) hostEntity.certificateUrl = hostDocumentUrl;
//    return hostEntity;
// }


export const mapHostUpgradeRequestDtoToInput = ({upgradeDto, hostDocumentUrl}: {
  upgradeDto: HostUpgradeRequestDto;
  hostDocumentUrl?: string;  // when re-apply, mandatory or not??
}): UpgradeHostInput => {
   const udgradeInput: UpgradeHostInput = {
      role: UserRole.HOST,
      organizationName: upgradeDto.organizationName,
      registrationNumber: upgradeDto.registrationNumber,
      businessAddress: upgradeDto.businessAddress,
      hostStatus: HostStatus.PENDING,
      hostAppliedAt: new Date(),
   };
   if (hostDocumentUrl) udgradeInput.certificateUrl = hostDocumentUrl;
   // if (hostDocumentUrl !== undefined) udgradeInput.certificateUrl = hostDocumentUrl;

   return udgradeInput;
};



export const mapToHostManageInput = (
  {hostId, action, reason}: HostManageRequestDto
): HostManageInput => {

   switch (action) {
      case "approve":
         return {
            hostStatus: HostStatus.APPROVED,
            hostReviewedAt: new Date(),
         };

      case "reject":
         return {
            hostStatus: HostStatus.REJECTED,
            hostRejectionReason: reason,
            hostReviewedAt: new Date(),
         };

      // case "block":
      //    return {
      //       hostStatus: HostStatus.BLOCKED,
      //       hostBlockReason: reason,
      //       hostReviewedAt: reviewedAt,
      //    };

      default:
         throw new Error("Invalid host action");
   }
};






// to update host details (eg: change host name, regNo, address, document etc) by user or admin
export const mapUpdateHostDTOToInput = ({isDoneByAdmin, updateDto, hostDocumentUrl}:{
   isDoneByAdmin: boolean,
   updateDto: HostUpgradeRequestDto,
   hostDocumentUrl?: string
}): HostUpdateInput => {
   const updateInput: HostUpdateInput = {};

   if (updateDto.organizationName !== undefined) updateInput.organizationName = updateDto.organizationName;
   if (updateDto.registrationNumber !== undefined) updateInput.registrationNumber = updateDto.registrationNumber;
   if (updateDto.businessAddress !== undefined) updateInput.businessAddress = updateDto.businessAddress;
   if (hostDocumentUrl !== undefined) updateInput.certificateUrl = hostDocumentUrl;
   if (!isDoneByAdmin) updateInput.hostStatus = HostStatus.PENDING;

   return updateInput;
};