// frontend/src/pages/admin/AdminUserList.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout"
import AdminBanner from "@/components/admin/admin-banner"
import { HostsList } from "@/components/admin/hosts-list"



const AdminHostsList = () => {
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

            <HostsList />
         </div>
      </AdminLayout>
   )
}

export default AdminHostsList