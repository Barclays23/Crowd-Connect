import { AuthForm } from '@/components/auth/AuthForm';
import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';




function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (formData: { email: string; password: string }) => {
      // console.log('Login form submitted:', formData);

      try {
        setIsLoading(true);
        const response = await login(formData);  // authContext function
        console.log('response in handleLogin: ', response);

        toast.success(response.message);
        navigate('/', { replace: true });   // Redirect to dashboard or home after successful login

      } catch (err: any) {
        console.error('Error in handleLogin:', err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || "Login failed.";
        toast.error(errorMessage);

        // Re-throw so form knows submission failed (prevents reset)
        // throw err;// why should throw from here?
      } finally {
        setIsLoading(false);
      }
    },
    [login, navigate]
  );

  return (
    <AuthForm
      key="login-form"
      mode="login"
      onSubmit={handleLogin}
      isLoading={isLoading}
    />
  );
}

export default Login;