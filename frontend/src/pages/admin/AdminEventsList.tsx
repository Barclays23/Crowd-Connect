// frontend/src/pages/admin/AdminEventList.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout";
import AdminBanner from "@/components/admin/admin-banner";
import { EventsList } from "@/components/admin/events-list";



const AdminEventList = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminBanner
          title="Welcome to Crowd Connect Admin"
          description="Manage users, events, bookings and more from your comprehensive dashboard"
          className=""
        />

        <EventsList />
      </div>
    </AdminLayout>
  );
};

export default AdminEventList;