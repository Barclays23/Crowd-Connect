// src/components/auth/ResetPasswordForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError } from '@/components/ui/FieldError'
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1'

import { authService } from '@/services/authServices'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

import { ResetPasswordSchema } from '@/schemas/auth.schema'


type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

interface ResetPasswordFormProps {
  token: string
  onSuccess?: () => void
}



export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsSubmitting(true)

      const response = await authService.resetPasswordService({
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      })

      toast.success(response.message)
      reset()
      onSuccess?.()
    } catch (error) {
      const errorMessage = getApiErrorMessage(error) || 'Unable to reset password.'
      if (errorMessage) toast.error(errorMessage);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      className="
        w-full max-w-md mx-auto my-10
        bg-[var(--card-bg)]
        text-[var(--text-primary)]
        shadow-[var(--card-shadow)]
        border border-[var(--card-border)]
      "
    >
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-[var(--heading-primary)]">
          Reset Your Password
        </CardTitle>
        <CardDescription className="mt-2 text-[var(--text-secondary)]">
          Enter and confirm your new password
        </CardDescription>
      </CardHeader>

      <CardContent className="relative min-h-[340px]">
        {isSubmitting && (
          <div
            className="
              absolute inset-0 z-10 !m-0 !p-0 flex items-center justify-center
              bg-[var(--bg-overlay)]
              backdrop-blur-[2px]
              rounded-lg
            "
          >
            <LoadingSpinner1
              size="md"
              message="Updating password..."
              subMessage="Just a moment"
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`space-y-5 transition-opacity ${
            isSubmitting ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          {/* New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[var(--text-secondary)]"
            >
              New Password
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="
                  h-11 pr-10
                  bg-[var(--form-input-bg)]
                  text-[var(--form-input-text)]
                  border border-[var(--form-input-border)]
                  placeholder:text-[var(--form-placeholder)]
                  focus-visible:ring-[var(--border-focus)]
                "
                disabled={isSubmitting}
                {...register('password')}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="
                  absolute right-0 top-0 h-11 px-3
                  text-[var(--btn-ghost-text)]
                  hover:bg-[var(--btn-ghost-hover)]
                "
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <FieldError message={errors.password?.message} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[var(--text-secondary)]"
            >
              Confirm Password
            </Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="
                  h-11 pr-10
                  bg-[var(--form-input-bg)]
                  text-[var(--form-input-text)]
                  border border-[var(--form-input-border)]
                  placeholder:text-[var(--form-placeholder)]
                  focus-visible:ring-[var(--border-focus)]
                "
                disabled={isSubmitting}
                {...register('confirmPassword')}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="
                  absolute right-0 top-0 h-11 px-3
                  text-[var(--btn-ghost-text)]
                  hover:bg-[var(--btn-ghost-hover)]
                "
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            className="
              w-full h-11 mt-6 font-medium
              bg-[var(--btn-primary-bg)]
              text-[var(--btn-primary-text)]
              hover:bg-[var(--btn-primary-hover)]
            "
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
