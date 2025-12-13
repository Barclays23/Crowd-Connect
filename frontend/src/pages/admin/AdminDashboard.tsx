// frontend/src/pages/admin/AdminDashboard.tsx
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { UsersList } from "@/components/admin/users-list"
import AdminBanner from "@/components/admin/admin-banner"
// import { CategoriesList } from "@/components/categories-list"
// import { HostSlabsList } from "@/components/host-slabs-list"
// import { EventsList } from "@/components/events-list"
// import { BookingsList } from "@/components/bookings-list"
// import { PaymentsList } from "@/components/payments-list"
// import { PayoutRequestsList } from "@/components/payout-requests-list"
// import { ReviewsList } from "@/components/reviews-list"



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

            {/* All Lists Stacked */}
            {/* <UsersList /> */}
            {/* <CategoriesList />
            <HostSlabsList />
            <EventsList />
            <BookingsList />
            <PaymentsList />
            <PayoutRequestsList />
            <ReviewsList /> */}
         </div>
      </AdminLayout>
   )
}

export default AdminDashboard