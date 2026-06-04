// frontend/src/pages/admin/AdminPayoutRequests.tsx

import { AdminLayout } from "@/components/layouts/AdminLayout";
import AdminBanner from "@/components/admin/admin-banner";
import { PayoutRequestsList } from "@/components/admin/payout-requests-list";

const AdminPayoutRequests = () => {
   return (
      <AdminLayout>
         <div className="space-y-8">
            <AdminBanner
               title="Payout Requests"
               description="Review and approve host payout requests. Approved amounts are credited directly to the host's Crowd Connect wallet."
            />
            <PayoutRequestsList />
         </div>
      </AdminLayout>
   );
};

export default AdminPayoutRequests;