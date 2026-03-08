// frontend/src/pages/admin/AdminBookingsList.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout";
import AdminBanner from "@/components/admin/admin-banner";
import { BookingsList } from "@/components/admin/bookings-list";


const AdminBookingsList = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminBanner
          title="Welcome to Crowd Connect Admin"
          description="Manage users, events, bookings and more from your comprehensive dashboard"
          className=""
        />
        <BookingsList />
      </div>
    </AdminLayout>
  );
};

export default AdminBookingsList;