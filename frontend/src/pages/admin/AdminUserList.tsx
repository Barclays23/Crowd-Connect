// frontend/src/pages/admin/AdminUserList.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { UsersList } from "@/components/admin/users-list"
import AdminBanner from "@/components/admin/admin-banner"



const AdminUserList = () => {
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

            <UsersList />
         </div>
      </AdminLayout>
   )
}

export default AdminUserList