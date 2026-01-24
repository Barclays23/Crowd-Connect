// frontend/src/pages/auth/Login.tsx
import { AuthForm } from '@/components/auth/AuthForm';
import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import type { LoginPayload } from '@/types/auth.types';



// Define a type for the 'from' location object
type LocationState = {
  from?: {
    pathname: string; // The path (e.g., /settings/profile)
    search: string; // The query string (e.g., ?tab=info)
    hash: string; // The fragment identifier (e.g., #details)
  };
};



function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const state = location.state as LocationState | null;
  // navigate back to original path || or home
  const fromPath = (state?.from?.pathname ?? '') + (state?.from?.search ?? '') || '/';

  const openForgotPassword =
  location.state?.openForgotPassword === true;





  const handleLogin = useCallback(
    async (formData: LoginPayload) => {
      // console.log('Login form submitted:', formData);

      try {
        setIsLoading(true);
        const response = await login(formData);
        // console.log('response in handleLogin: ', response);

        toast.success(response.message);

        navigate(fromPath, { replace: true });  // Redirect to original path or home after successful login

      } catch (err: unknown) {
        console.error('Error in handleLogin:', err);
        const errorMessage = getApiErrorMessage(err);
        toast.error(errorMessage);

      } finally {
        setIsLoading(false);
      }
    },

    
    [login, navigate, fromPath]
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