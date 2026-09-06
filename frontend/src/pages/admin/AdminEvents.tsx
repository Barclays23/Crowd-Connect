// frontend/src/pages/admin/AdminEvents.tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminBanner from "@/components/layout/admin-banner";
import { AdminEventsTable } from "@/components/admin/event/admin-events-table";



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