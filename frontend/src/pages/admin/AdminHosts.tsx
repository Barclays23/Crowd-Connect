// frontend/src/pages/admin/AdminHosts.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout"
import AdminBanner from "@/components/admin/admin-banner"
import { AdminHostsList } from "@/components/admin/admin-hosts-list"



const AdminHosts = () => {
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

            <AdminHostsList />
         </div>
      </AdminLayout>
   )
}

export default AdminHosts;