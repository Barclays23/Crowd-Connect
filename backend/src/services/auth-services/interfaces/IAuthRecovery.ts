// backend/src/services/auth-services/interfaces/IAuthRecovery.ts
import { ResetPasswordDto } from "@/dtos/auth.dto";




export interface IAuthRecoveryService {
    requestPasswordReset(email: string):Promise<string>
    validateResetLink(token: string): Promise<boolean>
    resetPassword({token, newPassword}: ResetPasswordDto):Promise<string>

    // also used for changing email & verifying email if not already verified
    requestAuthenticateEmail({currentUserEmail, requestedEmail}: {
        currentUserEmail: string,
        requestedEmail: string
    }): Promise<string>

    updateVerifiedEmail({ currentUserEmail, requestedEmail, otpCode}: {
        currentUserEmail: string;
        requestedEmail: string;
        otpCode: string;
    }): Promise<string>
}