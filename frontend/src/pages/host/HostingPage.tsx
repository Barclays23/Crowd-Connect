// frontend/src/pages/host/HostingPage.tsx
import { useEffect, useRef, useState } from 'react';
import HostHeroSection from '@/pages/host/HostHeroSection';
import HostEventSection from '@/pages/host/HostEventSection';
import { useAuth } from '@/contexts/AuthContext';
import { userServices } from '@/services/userServices';
import { LoadingSpinner1 } from '@/components/shared/LoadingSpinner1';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import { toast } from 'react-toastify';
import type { ApiResponse } from '@/types/common.types';
import type { UserState } from '@/types/user.types';




const HostingPage = () => {
   const hostEventRef = useRef<HTMLDivElement | null>(null);
   const { isAuthenticated, isLoading: isAuthLoading, setUser } = useAuth();

   const [isProfileFetching, setIsProfileFetching] = useState<boolean>(true);
   const hasFetchedRef = useRef<boolean>(false);

   useEffect(() => {
      if (isAuthLoading) return;
      if (!isAuthenticated) {
         setIsProfileFetching(false);
         return;
      }

      if (hasFetchedRef.current) return;

      const fetchUserProfile = async () => {
         hasFetchedRef.current = true;

         try {
            const response: ApiResponse<UserState> = await userServices.getUserProfile();
            setUser(response.data);

         } catch (error) {
            console.error('Failed to fetch user profile:', error);
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);

         } finally {
            setIsProfileFetching(false);
         }
      };

      fetchUserProfile();

   }, [isAuthLoading, isAuthenticated, setUser]);



   const scrollToHostEvent = () => {
      hostEventRef.current?.scrollIntoView({
         behavior: 'smooth',
         block: 'start',
      });
   };



   if (isAuthLoading || isProfileFetching) {
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
