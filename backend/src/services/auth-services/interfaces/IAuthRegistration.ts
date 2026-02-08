// backend/src/services/interfaces/IAuthRegistration.ts
import { SignUpRequestDto } from "@/dtos/auth.dto";
import { AuthResult } from "@/types/auth.types";





export interface IAuthRegistrationService {
    signUp(signUpDto: SignUpRequestDto): Promise<string>

    verifyAccount(email: string, otp: string): Promise<AuthResult>

    // can be changed to OtpServices
    resendOtp(email: string): Promise<string>
}