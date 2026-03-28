// frontend/src/components/host/HostEventSection.tsx
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredMessage from '@/components/host/AuthRequiredMessage';
import BlockedAccountMessage from '@/components/host/BlockedAccountMessage';
import HostUpgradeForm from '@/components/host/HostUpgradeForm';
import HostPendingState from '@/components/host/HostPendingState';
import HostRejectedState from '@/components/host/HostRejectedState';
import HostBlockedState from '@/components/host/HostBlockedState';
import AdminMessage from '@/components/host/AdminHostingMessage';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import EmailVerification from '@/components/host/EmailVerification';
import { useSearchParams } from 'react-router-dom';
import { GoogleMapsProvider2 } from '@/contexts/GoogleMapsProvider2';
import HostYourEvent from '@/components/host/HostYourEvent';





const HostEventSection = () => {
   const { user, isAuthenticated, isLoading } = useAuth();
   // const [showReapplyForm, setShowReapplyForm] = useState(false);
   const [searchParams] = useSearchParams();
   const isReapplyMode = searchParams.get('reapply') === 'true';


   if (isLoading) return <LoadingSpinner1 />;

   if (!isAuthenticated || !user) return <AuthRequiredMessage />;
   
   if (!user.isEmailVerified) return <EmailVerification />;
   if (user.status === 'blocked') return <BlockedAccountMessage />;
   if (user.role === 'admin') return <AdminMessage />;
   if (user.role === 'user') return <HostUpgradeForm isReapply={false} />
   if (user.role === 'host' &&
      user.hostStatus === 'rejected' && isReapplyMode) {
      return <HostUpgradeForm isReapply={true} />
   }


   if (user.role === 'host') {
      switch (user.hostStatus) {
         case 'pending':
            return <HostPendingState />;
         case 'rejected':
            return (
               <HostRejectedState
                  rejectionReason={user.hostRejectionReason}
               />
            );
         case 'blocked':
            return <HostBlockedState />;
         case 'approved':
            return (
               // <GoogleMapsProvider2>
               <HostYourEvent />
               // </GoogleMapsProvider2>
            )
         default:
            return (
               <LoadingSpinner1 />
            );
      }
   }

   return null;
};

export default HostEventSection;
