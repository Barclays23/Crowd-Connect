// frontend/src/components/layouts/AdminLayout.tsx
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { BreadcrumbNav } from "@/components/admin/breadcrumb-nav";
import { useSidebar } from "@/components/ui/sidebar";

interface AdminLayoutProps {
   children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
   const { state } = useSidebar();
   const isCollapsed = state === "collapsed";
   const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
   
   return (
      <div className="flex min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
         
         {/* Sidebar */}
         <AdminSidebar />

         {/* Main content area */}
         <div 
            className="flex flex-1 flex-col min-w-0 transition-all duration-200 ease-in-out"
            style={{
               marginLeft: !isMobile ? (isCollapsed ? '66px' : '190px') : '0',
               width: !isMobile ? `calc(100% - ${isCollapsed ? '66px' : '190px'})` : '100%'
            }}
            >
            
            {/* Top navbar */}
            <div className="sticky top-0 z-40 w-full">
               <AdminNavbar />
            </div>

            {/* Breadcrumb */}
            <BreadcrumbNav />

            {/* Scrollable main content */}
            <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
               <div className="container mx-auto p-4 sm:p-6 max-w-7xl w-full">
                  {children}
               </div>
            </main>
         </div>
      </div>
   );
}
export default AdminLayoutContent;