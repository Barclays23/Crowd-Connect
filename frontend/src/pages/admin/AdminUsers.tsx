// frontend/src/pages/admin/AdminUsers.tsx
import { AdminLayout } from "@/components/layout/AdminLayout"
import AdminBanner from "@/components/admin/admin-banner"
import { AdminUsersList } from "@/components/admin/admin-users-list";



const AdminUsers = () => {
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

            <AdminUsersList />
         </div>
      </AdminLayout>
   )
}

export default AdminUsers;