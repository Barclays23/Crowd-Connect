// frontend/src/pages/admin/AdminReviews.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminBanner from "@/components/admin/admin-banner";
import { AdminReviewsList } from "@/components/admin/review/admin-reviews-list";





const AdminReviews = () => {
   return (
      <AdminLayout>
         <div className="space-y-8">
            <AdminBanner
               title="Reviews & Ratings Management"
               description="Monitor user feedback, delete inappropriate reviews, and oversee platform reputation."
            />
            <AdminReviewsList />
         </div>
      </AdminLayout>
   );
};

export default AdminReviews;