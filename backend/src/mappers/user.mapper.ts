// backend/src/mappers/user.mapper.ts
import { CreateUserDTO } from "../dtos/user.dto";
import { AuthUserDto, SignUpRequestDto } from "../dtos/auth.dto";
import { CreateUserEntity, SensitiveUserEntity, SignUpUserEntity, UserEntity } from "../entities/user.entity";
import User, { IUserModel } from "../models/implementations/user.model";






// ------------------------------- MODEL to ENTITY ---------------------------------


// map UserModel to UserEntity (without password)
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



// map UserModel to SensitiveUserEntity
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


// map UserEntity to AuthUserDto (for auth responses)
export const mapUserEntityToAuthUserDto = (
  entity: UserEntity
): AuthUserDto => ({
  userId: entity.id.toString(),
  name: entity.name,
  email: entity.email,
  role: entity.role,
  status: entity.status,
//   mobile: entity?.mobile,
  profilePic: entity?.profilePic,
  isEmailVerified: entity.isEmailVerified,
});








// ------------------------------- DTO to ENTITY ---------------------------------


// map CreateUserDTO to CreateUserEntity (to create new user by admin)
export const mapCreateUserDTOToEntity = (
   dto: CreateUserDTO,
   hashedPassword: string
): CreateUserEntity => ({
   name: dto.name,
   email: dto.email,
   password: hashedPassword,
   role: dto.role,
   status: dto.status,
   mobile: dto?.mobile,
   profilePic: dto?.profilePic,
   isEmailVerified: false,
   isMobileVerified: false,
});




// map SignUpRequestDto to SignUpUserEntity (for user registration after verifying otp)
export const mapSignUpDtoToSignUpUserEntity = (
   dto: SignUpRequestDto,
): SignUpUserEntity => ({
   name: dto.name,
   email: dto.email,
   password: dto.password,
   isEmailVerified: true,  // since otp is already verified
});




// testing purpose (change function name if needed)
// export const mapUserToResponseDto = (user: any): UserResponseDTO => {
//    return {
//       id: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       role: user.role,
//    };
// };
