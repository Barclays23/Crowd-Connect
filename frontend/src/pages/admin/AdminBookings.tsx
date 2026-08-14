// frontend/src/pages/admin/AdminBookings.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminBanner from "@/components/admin/admin-banner";
import { AdminBookingsList } from "@/components/admin/booking/admin-bookings-list";


const AdminBookings = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminBanner
          title="Welcome to Crowd Connect Admin"
          description="Manage users, events, bookings and more from your comprehensive dashboard"
          className=""
        />
        <AdminBookingsList />
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;