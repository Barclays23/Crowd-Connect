// src/pages/ResetPasswordPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import { toast } from 'react-toastify';
import { authService } from '@/services/authServices';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';



export default function ResetPasswordPage() {
   const [isValidating, setIsValidating] = useState(true)
   const [isTokenValid, setIsTokenValid] = useState(false)
   const [errorMessage, setErrorMessage] = useState('')

   const [searchParams] = useSearchParams()
   const token = searchParams.get('token') || ''
   const UrlEmail = searchParams.get('email')

   const { user, isAuthenticated, logout } = useAuth()
   const navigate = useNavigate()

   const EmailFromLink = decodeURIComponent(UrlEmail || '').toLowerCase().trim()
   const currentUserEmail = user?.email?.toLowerCase().trim()

   useEffect(() => {
      let isMounted = true

      if (!token) {
         setErrorMessage('Missing or invalid reset token')
         setIsValidating(false)
         return
      }

      const validateToken = async () => {
         try {
         const response = await authService.validateResetLink(token)
         if (isMounted && response.isValid) {
            setIsTokenValid(true)
         }
         } catch (error) {
         if (isMounted) {
            const errorMessage = getApiErrorMessage(error)
            if (errorMessage) toast.error(errorMessage);
            setErrorMessage(errorMessage)
         }
         } finally {
         if (isMounted) setIsValidating(false)
         }
      }

      validateToken()
      return () => {
         isMounted = false
      }
   }, [token])

   /* ───────────────── Loading State ───────────────── */
      if (isValidating) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
               <LoadingSpinner1
                  size="lg"
                  message="Verifying reset link..."
                  subMessage="This will only take a moment"
               />
            </div>
         );
      }

   /* ───────────────── Error State ───────────────── */
   if (!isTokenValid) {
      return (
         <div
         className="
            min-h-screen flex items-center justify-center p-4
            bg-[var(--bg-primary)]
         "
         >
         <div
            className="
               max-w-md w-full text-center space-y-6
               bg-[var(--card-bg)]
               border border-[var(--card-border)]
               rounded-xl p-8
               shadow-[var(--card-shadow)]
            "
         >
            <div
               className="
               text-6xl font-bold
               text-[var(--status-error)]
               "
            >
               ×
            </div>

            <h2 className="text-2xl font-bold text-[var(--heading-primary)]">
               Reset Link Invalid
            </h2>

            <p className="text-[var(--text-secondary)] text-md">
               {errorMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
               <Button
                  size="lg"
                  variant="default"
                  onClick={() =>
                     navigate("/login", { state: { openForgotPassword: true } })
                  }
                  >
                  Request New Link
               </Button>

               <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/login")}
                  >
                  Back to Login
               </Button>

            </div>
         </div>
         </div>
      )
   }

   /* ───────────────── Logged-in User Handling ───────────────── */
   if (isAuthenticated && user) {
      if (EmailFromLink === currentUserEmail) {
         return (
            <div className="
               min-h-screen flex items-center justify-center p-4
               bg-[var(--bg-primary)]
               "
            >

               <ResetPasswordForm
                  token={token}
                  onSuccess={() => navigate('/login')}
               />
            </div>
         )
      }

      return (
         <div
         className="
            min-h-screen flex items-center justify-center p-4
            bg-[var(--bg-primary)]
         "
         >
         <div
            className="
               max-w-md w-full text-center space-y-6
               bg-[var(--card-bg)]
               border border-[var(--card-border)]
               rounded-xl p-8
               shadow-[var(--card-shadow)]
            "
         >
            <h2 className="text-2xl font-bold text-[var(--heading-primary)]">
               Different Account Detected
            </h2>

            <p className="text-1xl text-[var(--text-secondary)]">
               This reset link is for <strong>{EmailFromLink}</strong>
            </p>

            <p className="text-1xl text-[var(--text-secondary)]">
               You are logged in as <strong>{currentUserEmail}</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
               <Button
                  size="lg"
                  variant="default"
                  onClick={logout}
                  >
                  Log out & Continue
               </Button>
               <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/")}
                  >
                  Cancel
               </Button>
            </div>
         </div>
         </div>
      )
   }

   /* ───────────────── Default (Not Logged In) ───────────────── */
   return (
      <div className="
         min-h-screen flex items-center justify-center p-4
         bg-[var(--bg-primary)]
         "
      >
         <ResetPasswordForm
         token={token}
         onSuccess={() => navigate('/login')}
         />
      </div>
   )
}
