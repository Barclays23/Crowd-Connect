// frontend/src/components/host/HostEventSection.tsx
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredMessage from '@/components/host/AuthRequiredMessage';
import BlockedAccountMessage from '@/components/host/BlockedAccountMessage';
import HostUpgradeForm from '@/components/host/HostUpgradeForm';
import HostPendingState from '@/components/host/HostPendingState';
import HostRejectedState from '@/components/host/HostRejectedState';
import HostBlockedState from '@/components/host/HostBlockedState';
import AdminMessage from '@/components/host/AdminHostingMessage';
import { LoadingSpinner1 } from '@/components/shared/LoadingSpinner1';
import EmailVerification from '@/components/host/EmailVerification';
import { useSearchParams } from 'react-router-dom';
import HostYourEvent from '@/components/event/HostYourEvent';
import { HOST_STATUS, USER_ROLES, USER_STATUS } from '@/constants/user-system.constants';
import { useEffect, useRef, useState } from 'react';





const HostEventSection = () => {
   const { user, isAuthenticated } = useAuth();
   

   const hasFetched = useRef<boolean>(false);
   
   const [searchParams] = useSearchParams();
   const isReapplyMode = searchParams.get('reapply') === 'true';


   if (!isAuthenticated || !user) return <AuthRequiredMessage />;
   
   if (!user.isEmailVerified) return <EmailVerification />;
   if (user.status === USER_STATUS.BLOCKED) return <BlockedAccountMessage />;
   if (user.role === USER_ROLES.ADMIN) return <AdminMessage />;
   if (user.role === USER_ROLES.USER) return <HostUpgradeForm isReapply={false} />
   if (user.role === USER_ROLES.HOST &&
      user.hostStatus === HOST_STATUS.REJECTED && isReapplyMode) {
      return <HostUpgradeForm isReapply={true} />
   }


   if (user.role === USER_ROLES.HOST) {
      switch (user.hostStatus) {
         case HOST_STATUS.PENDING:
            return <HostPendingState />;
         case HOST_STATUS.REJECTED:
            return <HostRejectedState rejectionReason={user.hostRejectionReason}/>
         case HOST_STATUS.BLOCKED:
            return <HostBlockedState />;
         case HOST_STATUS.APPROVED:
            return <HostYourEvent />
         default:
            return <LoadingSpinner1 />
      }
   }

   return null;
};

export default HostEventSection;
