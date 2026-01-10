import { useState, useEffect } from "react";
import { Mail, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authServices";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { cn } from "@/lib/utils";
import { OtpSchema } from "@/schemas/otp.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";


type OtpFormData = z.infer<typeof OtpSchema>;




const EmailVerification = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { user, setUser } = useAuth();


  const form = useForm<OtpFormData>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      otpCode: "",
      email: user?.email ?? "",
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const otpCode = watch("otpCode");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }
  }, [user?.email, setValue]);

  // Clear server error when OTP changes
  useEffect(() => {
    setServerError(null);
  }, [otpCode]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);


  const handleSendOTP = async () => {
    const email = user?.email;
    if (!email) {
      toast.error("Email not found in your account");
      return;
    }

    try {
      setIsSendingOtp(true);
      setServerError(null);

      const response = await authService.requestAuthenticateEmail(email);
      
      toast.success(response.message || "Verification code sent to your email------- ----");
      
      setOtpSent(true);
      setCountdown(60);
      setValue("otpCode", "");
      
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
      setServerError(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    try {
      setServerError(null);

      const response = await authService.verifyEmailService({
        otpCode: data.otpCode,
        email: data.email,
      });
      
      toast.success("Email verified successfully! --------- 098765e setrcey");
      
      if (user && setUser) {
        setUser({
          ...user,
          isEmailVerified: true,
        });
      }
      
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
      setServerError(errorMessage);
    }
  };

  const hasError = !!errors.otpCode || !!serverError;
  const isComplete = otpCode.length === 6;
  const isBusy = isSubmitting || isSendingOtp;
  

  return (
    <>
      {isBusy && (
        <div className="fixed inset-0 z-50 !m-0 !p-0 flex items-center justify-center bg-(--bg-overlay2) backdrop-blur-[0.1px]">
            <LoadingSpinner1 
              message={
                isSubmitting
                  ? "Verifying your email"
                  : "Authenticating Email"
              }
              subMessage={
                isSubmitting
                  ? "Please wait..."
                  : "We're sending the code to your email"
              }
              size="lg"
            />
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-(--bg-primary)">
        <div className="max-w-md w-full rounded-2xl p-8 text-center bg-(--card-bg) border border-(--card-border) shadow-(--shadow-lg)">
          {/* Icon */}
          <div className={cn(
            "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
            otpSent ? "bg-(--badge-success-bg)" : "bg-(--badge-primary-bg)"
          )}>
            <Mail className={cn(
              "w-10 h-10",
              otpSent ? "text-(--status-success)" : "text-(--brand-primary)"
            )} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-3 text-(--heading-primary)">
            {otpSent ? "Enter Verification Code" : "Verify Your Email to Become a Host"}
          </h1>

          {/* Description */}
          {!otpSent ? (
            <>
              <p className="mb-1 text-sm leading-relaxed text-(--text-secondary)">
                Email verification is required to ensure security and enable host features.
                A verification code will be sent to:
              </p>

              <div className="mb-2 p-2 rounded-lg bg-(--bg-secondary)">
                <p className="text-sm text-(--text-tertiary) mb-1">Your email address:</p>
                <p className="font-medium text-(--text-primary) break-all">
                  {user?.email || "Loading..."}
                </p>
              </div>

              <div className="rounded-xl p-4 mb-8 bg-(--badge-info-bg) border border-(--badge-info-border)">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-(--badge-info-text)" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1 text-(--badge-info-text)">Why verify?</h3>
                    <ul className="text-sm space-y-1 text-(--badge-info-text)">
                      <li>• Secure your account and events</li>
                      <li>• Receive important event notifications</li>
                      <li>• Enable payment processing</li>
                      <li>• Access host-only features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="mb-6 text-(--text-secondary)">
              We sent a 6-digit code to <span className="font-semibold">{user?.email}</span>
            </p>
          )}

          {/* OTP Input (shown only when OTP is sent) */}
          {otpSent && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className={cn("transition-all duration-300", hasError && "animate-shake")}>
                <OtpInput
                  value={otpCode}
                  onChange={(val) => setValue("otpCode", val, { shouldValidate: true })}
                  length={6}
                  error={hasError}
                  autoFocus
                  disabled={isSubmitting}
                  // onComplete={() => handleSubmit(onSubmit)()}  // auto submit when completion
                />
              </div>

              {/* Error Message */}
              {(errors.otpCode?.message || serverError) && (
                <p className="text-sm text-red-500 text-center">
                  {errors.otpCode?.message || serverError}
                </p>
              )}

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={!isComplete || hasError || isSubmitting}
                variant="default"
                size="lg"
                className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          )}

          {/* Primary Action Button (Send/Resend) */}
          {!otpSent && (
            <Button
              onClick={handleSendOTP}
              disabled={isSendingOtp || countdown > 0}
              variant="default"
              size="lg"
              className="w-full mb-4 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
            >
              {isSendingOtp ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sending Verification Code...
                </>
              ) : countdown > 0 ? (
                `Resend available in ${countdown}s`
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          )}

          {/* Resend Option (shown only when OTP is sent) */}
          {otpSent && (
            <div className="mt-6 pt-6 border-t border-(--border-default)">
              <p className="text-sm text-(--text-tertiary) mb-2">
                Didn't receive the code?
              </p>
              <Button
                onClick={handleSendOTP}
                disabled={countdown > 0 || isSendingOtp}
                variant="ghost"
                className="font-medium"
              >
                {isSendingOtp
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend code"}
              </Button>
            </div>
          )}

          {/* Help Text (shown only when OTP is sent) */}
          {otpSent && (
            <div className="mt-6 p-4 rounded-lg bg-(--bg-secondary)">
              <p className="text-sm text-(--text-tertiary)">
                <strong>Check your spam/junk folder</strong> if you don't see the code
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmailVerification;