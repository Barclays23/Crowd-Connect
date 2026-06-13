import { ResetPasswordDto } from "@/dtos/auth.dto";


export interface IPasswordService {
    // when user fogot password and reset it
    resetPassword({token, newPassword}: ResetPasswordDto):Promise<string>

    // for user updating password when he need
    changeUserPassword(userEmail: string, data: { currentPassword: string; newPassword: string; }): Promise<void>;

}