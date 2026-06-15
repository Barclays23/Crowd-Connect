// frontend/src/pages/auth/GoogleAuthSuccess.tsx

import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';



export function GoogleAuthSuccess() {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const { setAccessToken } = useAuth();
   
   // Use a ref to prevent double-execution in React 18 Strict Mode
   const processedRef = useRef(false);

   useEffect(() => {
      if (processedRef.current) return;
      processedRef.current = true;

      const token = searchParams.get('token');
      
      if (token) {
         setAccessToken(token);
         toast.success('Successfully logged in with Google');
         
         // Redirect to home (or to user's last location/path)
         const returnPath = sessionStorage.getItem('oauth_return_path') || '/';
         sessionStorage.removeItem('oauth_return_path');

         navigate(returnPath, { replace: true });

      } else {
         toast.error('Google authentication failed. Please try again.');
         sessionStorage.removeItem('oauth_return_path');
         navigate('/login', { replace: true });
      }

   }, [searchParams, navigate, setAccessToken]);

   return (
      <div className="flex h-screen w-full items-center justify-center">
         <div className="flex flex-col items-center space-y-4">
            {/* You can replace this with your project's standard loading spinner */}
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium text-auth-text-muted">
               Completing authentication...
            </p>
         </div>
      </div>
   );
}

export default GoogleAuthSuccess;