// frontend/src/pages/auth/Login.tsx
import { AuthForm } from '@/components/auth/AuthForm';
import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { LoginPayload, RouterLocationState } from '@/types/auth.types';
import { logger } from '@/utils/logger';
import { isAxiosError } from 'axios';



function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const state = location.state as RouterLocationState | null;
  // navigate back to original path || or home
  // const fromPath = (state?.from?.pathname ?? '') + (state?.from?.search ?? '') || '/';
  const fromPath = state?.from 
    ? state.from.pathname + state.from.search + state.from.hash 
    : '/';

  const openForgotPassword = state?.openForgotPassword === true;
  const openBookingAfterLogin = state?.openBooking === true;



  const handleLogin = useCallback(
    async (formData: LoginPayload) => {
      // console.log('Login form submitted:', formData);

      try {
        setIsLoading(true);
        const response = await login(formData);
        // console.log('response in handleLogin: ', response);
        logger.info("response from handleLogin :", response);

        toast.success(response.message);

        navigate(fromPath, { 
          replace: true,
          state: { 
            openBooking: openBookingAfterLogin 
          }
        }
        );  // Redirect to original path or home after successful login

      } catch (err: unknown) {
        logger.error('Error in handleLogin:', err);

        let errorCode: string | undefined;
        
        if (isAxiosError(err)) {
          errorCode = err.response?.data?.code;
        }
        
        // check if the backend sent custom OAuth code
        if (errorCode === 'OAUTH_USER_LOGIN') {
          toast.info("Looks like you signed up with Google! Please click 'Continue with Google' below.", {
            icon: <span>👋</span>,
            autoClose: 6000,
          });
        } else {
          const errorMessage = getApiErrorMessage(err);
          if (errorMessage) toast.error(errorMessage);
        }

      } finally {
        setIsLoading(false);
      }
    },

    
    [login, navigate, fromPath, openBookingAfterLogin]
  );


  
  return (
    <AuthForm
      key="login-form"
      mode="login"
      onSubmit={handleLogin}
      isLoading={isLoading}
      openForgotPassword={openForgotPassword}
    />
  );
}

export default Login;