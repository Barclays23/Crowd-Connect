// src/components/auth/ForgotPasswordModal.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { authService } from '@/services/authServices'
import { toast } from 'react-toastify'
import { emailBase } from '@/schemas/auth.schema'
import { FieldError } from '../ui/FieldError'
import { SuccessCheckIcon } from '../ui/success-check-icon'
import { getApiErrorMessage } from '@/utils/errorMessages.utils'
import { LoadingSpinner1 } from '../common/LoadingSpinner1'
import { EMAIL_PROVIDERS } from '@/utils/UI.utils'


const ForgotPasswordSchema = z.object({
  email: emailBase,
})

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>

interface ForgotPasswordModalProps {
  onClose?: () => void
}




export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true)
      setSubmitState('idle')

      const response = await authService.requestFogotPassword(data.email)

      toast.success(response.message || 'Password reset link has been sent!')
      setSubmitState('success')

    } catch (error: unknown) {
      console.error('Error in ForgotPasswordModal onSubmit:', error);
      const errorMessage = getApiErrorMessage(error);
      if (errorMessage) toast.error(errorMessage);
      setSubmitState('error')

    } finally {
      setIsLoading(false)
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────
  // if (submitState === 'success') {
  //   return (
  //     <div className="py-6 px-3 text-center space-y-6">
  //       <SuccessCheckIcon size="md" />

  //       <div className="space-y-3">
  //         <h3 className="text-2xl font-semibold text-(--heading-primary)">
  //           Reset link sent!
  //         </h3>
  //         <p className="text-(--text-secondary) leading-relaxed">
  //           If an account with this email exists, you will receive a password reset link shortly.
  //         </p>
  //         <p className="text-xs text-(--text-tertiary) mt-2">
  //           Please check your inbox, spam and junk folders.
  //         </p>
  //       </div>

  //       <Button
  //         onClick={onClose}
  //         className="bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text) min-w-[150px]"
  //       >
  //         Back to login
  //       </Button>
  //     </div>
  //   )
  // }

  if (submitState === 'success') {
    return (
      <div className="py-6 px-3 text-center space-y-6">
        <SuccessCheckIcon size="md" />

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-(--heading-primary)">
            Reset link sent!
          </h3>
          <p className="text-(--text-secondary) leading-relaxed">
            If an account with this email exists, you will receive a password
            reset link shortly.
          </p>
          <p className="text-xs text-(--text-tertiary) mt-2">
            Please check your inbox, spam and junk folders.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-(--text-secondary)">
            Open your inbox
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EMAIL_PROVIDERS.map(({ name, url, bg, border, icon }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg border
                  border-(--border-default) text-sm text-(--text-secondary) bg-(--bg-secondary)
                  hover:bg-(--bg-accent)
                  
                  transition-all duration-150 cursor-pointer
                `}
              >
                {icon}
                <span>{name}</span>
              </a>
            ))}
          </div>
        </div>

        <Button
          onClick={onClose}
          variant="default"
          className="min-w-36"
        >
          Back to login
        </Button>
      </div>
    )
  }



  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isLoading && (
        <div className="absolute inset-0 z-10 !m-0 !p-0 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-[2px] rounded-lg">
          <LoadingSpinner1
            size="md"
            message="Sending reset link..."
            subMessage="This usually takes just a few seconds"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="youremail@example.com"
          autoComplete="email"
          disabled={isLoading}
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </div>
    </form>
  )
}