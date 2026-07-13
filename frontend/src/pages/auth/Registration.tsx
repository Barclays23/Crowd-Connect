// frontend/src/pages/auth/Registration.tsx
import { AuthForm } from '@/components/auth/AuthForm';
import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { EmailResponseData, RegisterPayload } from '@/types/auth.types';
import type { ApiResponse } from '@/types/common.types';





function Registration() {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();



  
  const handleRegistration = useCallback(async (formData: RegisterPayload) => {
    // console.log('data received in Registration:', formData);

    try {
      setIsLoading(true);
      const response: ApiResponse<EmailResponseData> = await register(formData);
      console.log("response in handleRegistration:", response);
      toast.success(response.message);
      
      navigate('/otp-verification', { 
        state: { 
          email: response?.data.email, 
          otpSentAt: Date.now(),
          successPath: '/' // navigate here after successful OTP verification
        } 
      });
      
    } catch (err: unknown) {
      console.error("Error in handleRegistration:", err);
      const errorMessage = getApiErrorMessage(err);
      if (errorMessage) toast.error(errorMessage);

    } finally {
      setIsLoading(false);
    }
  }, [register, navigate]);



  return (
    <AuthForm
      key="registration-form"
      mode="register" 
      onSubmit={handleRegistration}
      isLoading={isLoading}
    />
  );
}

export default Registration;