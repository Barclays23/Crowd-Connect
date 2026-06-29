// frontend/src/pages/admin/AdminEvents.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout";
import AdminBanner from "@/components/admin/admin-banner";
import { AdminEventsTable } from "@/components/admin/admin-events-table";



const AdminEvents = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminBanner
          title="Welcome to Crowd Connect Admin"
          description="Manage users, events, bookings and more from your comprehensive dashboard"
          className=""
        />

        <AdminEventsTable />
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;