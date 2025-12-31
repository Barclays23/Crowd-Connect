// frontend/src/components/host/HostEventSection.tsx
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredMessage from '@/components/host/AuthRequiredMessage';
import BlockedAccountMessage from '@/components/host/BlockedAccountMessage';
import HostUpgradeForm from '@/components/host/HostUpgradeForm';
import HostPendingState from '@/components/host/HostPendingState';
import HostRejectedState from '@/components/host/HostRejectedState';
import HostBlockedState from '@/components/host/HostBlockedState';
import HostEventForm from '@/components/host/HostEventForm';
import AdminMessage from '@/components/host/AdminHostingMessage';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';






const HostEventSection = () => {
   const { user, isAuthenticated, isLoading } = useAuth();

   if (isLoading) return <LoadingSpinner1 />;

   if (!isAuthenticated || !user) return <AuthRequiredMessage />;
   
   if (user.status === 'blocked') return <BlockedAccountMessage />;
   if (user.role === 'admin') return <AdminMessage />;
   if (user.role === 'user') return <HostUpgradeForm />;


   if (user.role === 'host') {
      switch (user.hostStatus) {
         case 'pending':
         return <HostPendingState />;
         case 'rejected':
         return <HostRejectedState rejectionReason={user.hostRejectionReason} />;
         case 'blocked':
         return <HostBlockedState />;
         default: // case "approved" :
         return <HostEventForm />;
      }
   }

   return null;
};

export default HostEventSection;
