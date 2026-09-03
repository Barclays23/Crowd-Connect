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
import { USER_ROLES } from '@/constants/user-system.constants';




const HostingPage = () => {
   const hostEventRef = useRef<HTMLDivElement | null>(null);
   // const [isLoading, setIsLoading] = useState(false);
   const { user, isAuthenticated, isLoading: isAuthLoading, setUser } = useAuth();

   const hasFetchedRef = useRef(false);

   useEffect(() => {
      if (isAuthLoading || !isAuthenticated) return;

      if (user?.role === USER_ROLES.HOST && user?.hostStatus) return;

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
         }
      };

      fetchUserProfile();

   // }, [isAuthenticated, setUser]);
   }, [isAuthLoading, isAuthenticated, user?.role, user?.hostStatus, setUser]);



   const scrollToHostEvent = () => {
      hostEventRef.current?.scrollIntoView({
         behavior: 'smooth',
         block: 'start',
      });
   };



   if (isAuthLoading) {
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
