// src/types/email.types.ts

export interface SendEmailOptions {
  toAddress     : string;
  mailSubject?  : string;
  text?         : string;
  htmlTemplate? : string;
}




// 1. Define all your template filenames as an Enum
export enum EmailTemplate {
  OTP_VERIFICATION              = "otpEmail.html",
  VERIFY_EMAIL                  = 'verifyEmail.html',
  WELCOME_USER                  = "welcomeEmail.html",
  BOOKING_CONFIRMATION          = "bookingConfirmation.html",
  PASSWORD_RESET                = "passwordReset.html"
}


// _____________________ EMAIL PAYLOAD VARIABLES ____________________________________________

export interface OtpEmailPayload {
  USER_NAME         : string;
  OTP_CODE          : string;
  EXPIRY_MINUTES    : number;
}

export interface VerifyEmailPayload {
    USER_NAME       : string;
    OTP_NUMBER      : string;
    EXPIRY_MINUTES  : number;
    CURRENT_YEAR    : number;
    GREETING_SUFFIX : string;
    EMAIL_HEADING   : string;
    EMAIL_MESSAGE   : string;
}


export interface WelcomeEmailPayload {
  USER_NAME     : string;
  DASHBOARD_LINK: string;
}


export interface PasswordResetPayload {
  USER_NAME     : string;
  RESET_LINK    : string;
  EXPIRY_MINUTES: number;
}


export interface BookingConfirmationPayload {
  USER_NAME: string;
  EVENT_TITLE: string;
  EVENT_DATE: string;
  TICKET_QR_CODE_URL: string;
}


// 3. Map the Enum to the exact payload interface
export type TemplatePayloadMap = {
  [EmailTemplate.OTP_VERIFICATION]              : OtpEmailPayload;
  [EmailTemplate.VERIFY_EMAIL]                  : VerifyEmailPayload;
  [EmailTemplate.WELCOME_USER]                  : WelcomeEmailPayload;
  [EmailTemplate.BOOKING_CONFIRMATION]          : BookingConfirmationPayload;
  [EmailTemplate.PASSWORD_RESET]                : PasswordResetPayload;
};