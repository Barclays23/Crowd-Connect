// frontend/src/pages/host/HostingPage.tsx
import { useEffect, useRef, useState } from 'react';
import HostHeroSection from '@/pages/host/HostHeroSection';
import HostEventSection from '@/pages/host/HostEventSection';
import { useAuth } from '@/contexts/AuthContext';
import { userServices } from '@/services/userServices';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import { toast } from 'react-toastify';
import type { ApiResponse } from '@/types/common.types';
import type { UserState } from '@/types/user.types';




const HostingPage = () => {
   const hostEventRef = useRef<HTMLDivElement | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const { isAuthenticated, setUser } = useAuth();

   const hasFetchedRef = useRef(false);

   useEffect(() => {
      if (!isAuthenticated || hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      const fetchUserProfile = async () => {

         try {
            setIsLoading(true);
            const response: ApiResponse<UserState> = await userServices.getUserProfile();
            console.log('Host User Profile data in HostingPage:', response.data);
            toast.success(response.message)
            setUser(response.data);

         } catch (error) {
            console.error('Failed to fetch user profile:', error);
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);

         } finally {
            setIsLoading(false);
         }
      };

      fetchUserProfile();

   }, [isAuthenticated, setUser]);



   const scrollToHostEvent = () => {
      hostEventRef.current?.scrollIntoView({
         behavior: 'smooth',
         block: 'start',
      });
   };



   if (isLoading) {
      return <LoadingSpinner1 
         className="min-h-screen"
         message="Loading your host profile"
         subMessage="Please wait"
      />
   };



   return (
      <div className="min-h-screen bg-(--bg-primary)" >
         {/* Landing / Hero Section */}
         <HostHeroSection onHostClick={scrollToHostEvent} />

         {/* Host Event Logic Section */}
         <div ref={hostEventRef}>
            <HostEventSection />
         </div>
      </div>
   );
};

export default HostingPage;
