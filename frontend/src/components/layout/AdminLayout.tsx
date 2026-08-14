// frontend/src/components/layout/AdminLayout.tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminLayoutContent from "@/components/layout/AdminLayoutContent";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}