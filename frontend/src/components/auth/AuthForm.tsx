import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/ui/FieldError";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "../ui/modal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
  onSubmit?: (data: z.infer<typeof RegisterSchema> | z.infer<typeof LoginSchema>) => Promise<void>;
  isLoading: boolean;
  openForgotPassword?: boolean;
}

export function AuthForm({ mode, onSubmit, isLoading = false, openForgotPassword = false }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(openForgotPassword);


  const isRegister = mode === "register";

  // ---- forms and zod validations -------------------------------------------------
  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const currentForm = isRegister ? registerForm : loginForm;
  const { handleSubmit, formState } = currentForm;
  const { errors } = formState;
  // console.log('authForm errors :', errors);


  // ---- form submit -------------------------------------------------
  const onValid = async (data: z.infer<typeof RegisterSchema> | z.infer<typeof LoginSchema>) => {
    // console.log(`${isRegister ? "Registration" : "Login"} submitted:`, data);
    console.log(`${isRegister ? "Registration" : "Login"} submitted:`);

    if (!onSubmit) return;
    
    try {
      setIsSubmittingForm(true);
      await onSubmit?.(data);
      // currentForm.reset();

    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-10 bg-[var(--card-bg)] shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-foreground">
          {isRegister ? "Create Your Account" : "Welcome Back"}
        </CardTitle>
        <CardDescription className="text-auth-text-muted">
          {isRegister
            ? "Join us and start your journey today"
            : "Log in to continue your journey"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          {/* Full Name - Register Only */}
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                {...registerForm.register("name")}
                type="text"
                placeholder="Enter your full name"
                className="h-11 border-auth-input focus:border-auth-input-focus focus:ring-auth-input-focus"
              />
              <FieldError message={(errors as typeof registerForm.formState.errors).name?.message} />
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              {...(isRegister ? registerForm.register("email") : loginForm.register("email"))}
              type="email"
              placeholder="Enter your email"
              className="h-11 border-auth-input focus:border-auth-input-focus focus:ring-auth-input-focus"
            />
            <FieldError message={errors.email?.message} />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                {...(isRegister ? registerForm.register("password") : loginForm.register("password"))}
                type={showPassword ? "text" : "password"}
                placeholder={isRegister ? "Create a password" : "Enter your password"}
                className="h-11 border-auth-input focus:border-auth-input-focus focus:ring-auth-input-focus pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-auth-text-muted" />
                ) : (
                  <Eye className="h-4 w-4 text-auth-text-muted" />
                )}
              </Button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          {/* Confirm Password - Register Only */}
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  {...registerForm.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="h-11 border-auth-input focus:border-auth-input-focus focus:ring-auth-input-focus pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-auth-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-auth-text-muted" />
                  )}
                </Button>
              </div>
              <FieldError message={(errors as typeof registerForm.formState.errors).confirmPassword?.message} />
            </div>
          )}

          {/* Terms Checkbox - Register Only */}
          {isRegister && (
            <div className="space-y-2">
              <div className="flex items-start space-x-2 pt-2">
                <Controller
                  name="agreeTerms"
                  control={registerForm.control}
                  render={({ field }) => (
                    <Checkbox
                      id="agreeTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-auth-input data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                    />
                  )}
                />
                <Label
                  htmlFor="agreeTerms"
                  className="text-sm text-auth-text-muted cursor-pointer leading-tight"
                >
                  I agree to{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms & Conditions
                  </a>
                </Label>
              </div>
              <FieldError message={(errors as typeof registerForm.formState.errors).agreeTerms?.message} />
            </div>
          )}

          {/* Forgot Password - Login Only */}
          {!isRegister && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[var(--link-text)] hover:text-[var(--link-text-hover)] hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            disabled={isSubmittingForm || isLoading}
            // className="w-full h-11 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] font-medium"
            className="w-full h-11 font-medium"
          >
            {isSubmittingForm || isLoading
              ? "Loading..."
              : isRegister ? "Register" : "Login"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-auth-divider" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-auth-card px-2 text-auth-text-muted">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login */}
        <Button
          variant="outline"
          className="w-full h-11 border-auth-input hover:bg-primary-light font-medium"
          onClick={() => console.log("Continue with Google")}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Toggle Link */}
        <div className="text-center text-sm text-auth-text-muted">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            to={isRegister ? "/login" : "/register"}
            className="text-[var(--link-text)] hover:text-[var(--link-text-hover)] hover:underline font-medium"
          >
            {isRegister ? "Login here" : "Register here"}
          </Link>
        </div>
      </CardContent>

      <Modal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        title="Reset your password"
        size="sm"
      >
        <ForgotPasswordModal 
          onClose={() => setShowForgotPassword(false)}
        />
      </Modal>

    </Card>
    
  );
}