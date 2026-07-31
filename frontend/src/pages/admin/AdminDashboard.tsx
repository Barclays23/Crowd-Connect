// frontend/src/pages/admin/AdminDashboard.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout"
import AdminBanner from "@/components/admin/admin-banner"


const AdminDashboard = () => {
   return (
      <AdminLayout 
         // title="Dashboard" 
         // subtitle="Overview of all platform activities"
      >

         {/* Dashboard Page Content */}
         <div className="space-y-8">
            {/* Welcome Section */}
            <AdminBanner
               title="Welcome to Crowd Connect Admin"
               description="Manage users, events, bookings and more from your comprehensive dashboard"
               className=""
            />

            <h1 className="text-6xl text-center font-mono">Admin Dashboard Contents</h1>

         </div>
      </AdminLayout>
   )
}

export default AdminDashboard