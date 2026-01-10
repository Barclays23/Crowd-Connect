// frontend/src/components/auth/OTPVerification.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FieldError } from "@/components/ui/FieldError";
import { OtpInput } from "@/components/ui/otp-input";
import { z } from "zod";
import { OtpSchema } from "@/schemas/otp.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authService } from "@/services/authServices";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

type OtpFormData = z.infer<typeof OtpSchema>;

export function OTPVerification() {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { email: userEmail, otpSentAt, successPath } = (location.state ?? {}) as {
    email?: string;
    otpSentAt?: number;
    successPath?: string;
  };

  const { setAccessToken, setUser } = useAuth();

  const form = useForm<OtpFormData>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      otpCode: "",
      email: userEmail ?? "",
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

  // Clear server error when OTP code changes
  useEffect(() => {
    setServerError(null);
  }, [otpCode]);

  // Initialize countdown
  useEffect(() => {
    if (!userEmail) return;

    const key = `otpSentAt:${userEmail}`;
    const stored = sessionStorage.getItem(key);
    const startedAt = otpSentAt ?? (stored ? Number(stored) : null);

    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setCountdown(remaining);
    }
  }, [userEmail, otpSentAt]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);



  const handleResendOTP = async () => {
    if (!userEmail) {
      setServerError("Email not found. Cannot resend OTP.");
      return;
    }

    try {
      setIsResending(true);
      setServerError(null);

      const startedAt = Date.now();
      sessionStorage.setItem(`otpSentAt:${userEmail}`, String(startedAt));
      setCountdown(60);

      const response = await authService.resendOtpService({ email: userEmail });
      
      // Clear the OTP input when resending
      setValue("otpCode", "", { shouldValidate: false });
      
      toast.success(response.message || "OTP resent successfully");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to resend OTP. Please try again.";

      toast.error(message);
      setServerError(message);

      if (message.toLowerCase().includes("expired")) {
        navigate(-1);
      }
    } finally {
      setIsResending(false);
    }
  };



  const onSubmit = async (data: OtpFormData) => {
    if (!userEmail) {
      setServerError("Email not found. Cannot verify OTP.");
      return;
    }

    try {
      setServerError(null);

      const response = await authService.verifyAccountService({
        otpCode: data.otpCode,
        email: userEmail,
      });

      const { accessToken, authUser } = response;

      setAccessToken(accessToken);
      setUser(authUser);

      toast.success(response.message || "Account verified successfully");

      // Most common pattern after verification → dashboard/home
      navigate(successPath || "/", { replace: true });
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "OTP verification failed. Please try again.";

      toast.error(message);
      setServerError(message);

      if (message.toLowerCase().includes("session expired")) {
        navigate(-1);
      }
    }
  };

  
  const hasError = !!errors.otpCode || !!serverError;
  const isComplete = otpCode.length === 6;
  const isDisabled = !isComplete || hasError || isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto my-10">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className={cn("transition-all duration-300", hasError && "animate-shake")}>
            <OtpInput
              value={otpCode}
              onChange={(val) => setValue("otpCode", val, { shouldValidate: true })}
              length={6}
              error={hasError}
              autoFocus
              disabled={isSubmitting}
              // Uncomment next line if you want auto-submit when 6 digits are entered
              // onComplete={() => handleSubmit(onSubmit)()}
            />
          </div>

          <FieldError
            className="text-center"
            message={errors.otpCode?.message || (serverError ?? undefined)}
          />

          <Button
            type="submit"
            disabled={isDisabled}
            className="w-full h-11 font-medium"
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
          <Button
            variant="ghost"
            onClick={handleResendOTP}
            disabled={countdown > 0 || isResending}
            className="font-medium"
          >
            {isResending
              ? "Sending..."
              : countdown > 0
              ? `Resend in ${countdown}s`
              : "Resend OTP"}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-center">
          <strong>Check your spam/junk folder</strong> if you don't see the code
        </div>
      </CardContent>
    </Card>
  );
}