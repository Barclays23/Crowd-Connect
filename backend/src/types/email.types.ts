// src/types/email.types.ts

// 1. Define all your template filenames as an Enum
export enum EmailTemplate {
  OTP_VERIFICATION              = "otpEmail.html",
  WELCOME_USER                  = "welcomeEmail.html",
  EVENT_BOOKING_CONFIRMATION    = "eventConfirmation.html",
  PASSWORD_RESET                = "passwordReset.html"
}


// _____________________ EMAIL PAYLOAD VARIABLES ____________________________________________

export interface OtpEmailPayload {
  USER_NAME         : string;
  OTP_CODE          : string;
  EXPIRY_MINUTES    : number;
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


export interface EventConfirmationPayload {
  USER_NAME: string;
  EVENT_TITLE: string;
  EVENT_DATE: string;
  TICKET_QR_CODE_URL: string;
}


// 3. Map the Enum to the exact payload interface
export type TemplatePayloadMap = {
  [EmailTemplate.OTP_VERIFICATION]              : OtpEmailPayload;
  [EmailTemplate.WELCOME_USER]                  : WelcomeEmailPayload;
  [EmailTemplate.EVENT_BOOKING_CONFIRMATION]    : EventConfirmationPayload;
  [EmailTemplate.PASSWORD_RESET]                : PasswordResetPayload;
};