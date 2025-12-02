import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { OtpSchema } from "@shared/schemas/otp.schema";
import { FieldError } from "../ui/FieldError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authService } from "@/services/authServices";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'react-toastify';


type OtpFormData = z.infer<typeof OtpSchema>;



export function OTPVerification() {
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isLoading, setLoading] = useState(false);
    
    const OTP_LENGTH = 6;
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));
    
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = (location.state as { email?: string } | undefined)?.email;
    const otpSentAt = (location.state as { email?: string; otpSentAt?: number } | undefined)?.otpSentAt;
    const successPath = (location.state as { successPath?: string } | undefined)?.successPath;


    const { setAccessToken, setUser } = useAuth();


    // Initialize React Hook Form
    const { 
        handleSubmit, 
        setValue, 
        watch,
        formState: { errors, isSubmitting } 
    } = useForm<OtpFormData>({
        resolver: zodResolver(OtpSchema),
        defaultValues: {
            otpCode: "",
            email: userEmail ?? ""
        },
        mode: "onSubmit",
    });


    // Watch the entire OTP code from the form state
    const otpCode = watch("otpCode");
    const otpArray = otpCode.split("").slice(0, OTP_LENGTH);


    // Initialize countdown from navigation state or sessionStorage
    useEffect(() => {
      // prefer nav state if present, otherwise sessionStorage
      const key = userEmail ? `otpSentAt:${userEmail}` : undefined;
      const stored = key ? sessionStorage.getItem(key) : null;
      const startedAt = otpSentAt ?? (stored ? Number(stored) : undefined);

      if (startedAt) {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        if (remaining > 0) setCountdown(remaining);
      }
    }, [userEmail, otpSentAt]);


    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

        return () => clearTimeout(timer);
    }, [countdown]);


    useEffect(() => {
      if (userEmail) setValue("email", userEmail, { shouldValidate: true });
    }, [userEmail, setValue]);


    const handleInputChange = (index: number, value: string) => {
        setValidationError(null);

        // Only allow single digit numbers
        const nextChar = value.length > 1 ? value.slice(-1) : value;
        if (nextChar && !/\d/.test(nextChar)) return;
        
        const newOtpArray = [...otpArray];
        newOtpArray[index] = nextChar;
        const newOtpCode = newOtpArray.join("");

        const shouldValidate = newOtpCode.length === OTP_LENGTH;
        setValue("otpCode", newOtpCode, { shouldValidate });

        // Auto-focus next input
        if (nextChar && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        }
    };



    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!otpArray[index] && index > 0) {
                // Move back and clear the previous input if the current is empty
                const prevIndex = index - 1;
                const newOtpArray = [...otpArray];
                newOtpArray[prevIndex] = ""; // Clear the previous digit
                setValue("otpCode", newOtpArray.join(""), { shouldValidate: true });
                inputRefs.current[prevIndex]?.focus();
                e.preventDefault(); // Prevent default backspace behavior after moving
            } else if (otpArray[index]) {
                // Clear the current input before the default backspace
                const newOtpArray = [...otpArray];
                newOtpArray[index] = "";
                setValue("otpCode", newOtpArray.join(""), { shouldValidate: true });
                // Don't prevent default, allow the keypress to complete
            }
        }
    };


    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        
        // Filter and slice the pasted data to match the OTP length
        const numericPastedData = pastedData.split('').filter(char => /\d/.test(char)).join('').slice(0, OTP_LENGTH);

        // Update the RHF value. No padding needed, Zod validation handles length.
        setValue("otpCode", numericPastedData, { shouldValidate: true });
        
        // Focus the next input (after the last pasted digit) or the last one
        const nextIndex = Math.min(numericPastedData.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
    };



    const handleResendOTP = async () => {
        if (!location.state?.email) {
            setValidationError("Email not found. Cannot resend OTP.");
            return;
        }

        try {
            setIsResending(true);
            const startedAt = Date.now();
            setCountdown(60);
            setValidationError(null);

            // persist send time so timer survives reload
            const key = `otpSentAt:${userEmail}`;
            if (key) sessionStorage.setItem(key, String(startedAt));

            const response = await authService.resendOtpService({ email: userEmail! });
            console.log("OTP resent successfully");
            toast.success(response.message);

        } catch (error) {
            console.error("Error resending OTP:", error);
            const errorMessage = (error as any).response?.data?.error || (error as any).response?.data?.message || "Failed to resend OTP. Please try again later.";
            toast.error(errorMessage);
            setValidationError(errorMessage);

            if (errorMessage.toLowerCase().includes("expired")) {
                navigate(-1); // Navigates to the previous entry in the history stack (if session expired)
            }

        } finally {
            setIsResending(false);
        }
    };



    const onSubmit = async (data: OtpFormData) => {
        const otpCode = data.otpCode;
        console.log("submitted OTP:", otpCode);
        console.log("user email:", userEmail);

        if (!userEmail) {
            setValidationError("Email not found. Cannot verify OTP.");
            return;
        }

        try {
            setLoading(true);
            const response = await authService.verifyOtpService({otpCode, email: userEmail!});
            console.log("response after OTP verification:", response);
            const { accessToken, userData } = response;
            setAccessToken(accessToken);
            setUser(userData);
            setValidationError(null);

            toast.success(response.message);
            // Navigate to the dynamic path, or default to a safe route
            // toast.info(successPath ? `Navigating to successpath: ${successPath}` : "Navigating to login page");
            navigate(successPath || '/login', { replace: true });

        } catch (error) {
            console.error("Error verifying OTP:", error);
            const errorMessage = (error as any).response?.data?.error || (error as any).response?.data?.message || "OTP verification failed. Please try again.";
            toast.error(errorMessage);
            setValidationError(errorMessage);
            if (errorMessage.toLowerCase().includes("session expired")) {
                // Navigate back to previous page if session expired.
                navigate(-1); // Navigates to the previous entry in the history stack
            }
        } finally {
            setLoading(false);
        }

    };





    const isComplete = otpCode.length === OTP_LENGTH;
    const formError = errors.otpCode?.message || validationError;

  // The submit button is disabled if RHF finds errors OR if not all fields are complete
    const isSubmitDisabled = !isComplete || !!errors.otpCode || isSubmitting || isLoading || isResending;


    return (
        <Card className="w-full max-w-md mx-auto my-10">
            <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-foreground">Verify OTP</CardTitle>
                <CardDescription className="text-auth-text-muted">
                Enter the 6-digit code sent to your email or mobile
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex justify-center space-x-3">
                        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                        <Input
                            key={index}
                            ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            pattern="\d"
                            maxLength={1}
                            value={otpArray[index] || ""}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-12 h-12 text-center text-lg font-semibold bg-background border-auth-input focus:border-auth-input-focus focus:ring-auth-input-focus"
                            autoComplete="one-time-code"
                        />
                        ))}
                    </div>
                    <FieldError className="text-center" message={formError ?? undefined} />

                    <Button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="w-full h-11 font-medium"
                    >
                        {isSubmitting || isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                </form>

                <div className="text-center space-y-3">
                    <p className="text-sm text-auth-text-muted">
                        Didn't receive the code?
                    </p>
                
                    <Button
                        variant="ghost"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || isResending}
                        className="font-medium"
                    >
                        {isResending ? (
                        "Sending..."
                        ) : countdown > 0 ? (
                        `Resend in ${countdown}s`
                        ) : (
                        "Resend OTP"
                        )}
                    </Button>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
                    <p className="text-sm text-foreground text-center">
                        <strong>Check your spam folder</strong> if you don't see the code in your inbox
                    </p>
                </div>

                {/* <div className="text-center text-sm text-auth-text-muted">
                <a href="#" className="text-primary hover:underline font-medium">
                    Change email or mobile number
                </a>
                </div> */}
            </CardContent>
        </Card>
    );
}