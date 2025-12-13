// frontend/src/components/admin/admin-sidebar.tsx
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
  Users,
  Calendar,
  FolderOpen,
  Layers3,
  CreditCard,
  LayoutDashboard,
  DollarSign,
  FileText,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Home", url: "/", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Events", url: "/admin/events", icon: Calendar },
  { title: "Bookings", url: "/admin/bookings", icon: CreditCard },
  { title: "Categories", url: "/admin/categories", icon: FolderOpen },
  { title: "Payments", url: "/admin/payments", icon: DollarSign },
  { title: "Payout Requests", url: "/admin/payout-requests", icon: FileText },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
]


export function AdminSidebar() {
  const location = useLocation()
  const currentPath = location.pathname
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="z-50 border-r border-[var(--border-default)]">
      {/* Header */}
      <SidebarHeader className="border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between px-2 py-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-hover)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">CC</span>
          </div>

          {/* Full title – hidden when collapsed */}
          <div className="flex flex-col ml-3 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Crowd Connect
            </span>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Admin Panel
            </span>
          </div>
        </div>

        {/* Sidebar Menu Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2
            p-1.5 rounded-full border shadow-[var(--shadow-md)]
            transition-all duration-200 z-10
            bg-[var(--bg-primary)] border-[var(--border-muted)] 
            text-[var(--text-secondary)]
            hover:bg-[var(--bg-accent)] hover:text-[var(--text-brand)] hover:border-[var(--border-brand)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
            group-data-[collapsible=icon]:flex
          `}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel style={{ color: "var(--text-secondary)" }}>NAV</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon

                // Fixed active state logic
                const isActive =
                  item.url === "/admin"
                    ? currentPath === "/admin" || currentPath === "/admin/" // Dashboard only active on exact /admin
                    : currentPath === item.url || currentPath.startsWith(item.url + "/")

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? item.title : undefined}
                      className={`
                        rounded-xl mx-0 my-0.5 px-3 py-2 transition-all duration-200
                        group-data-[collapsible=icon]:px-2
                      `}
                      style={{
                        backgroundColor: isActive ? "var(--brand-primary)" : "transparent",
                        color: isActive ? "white" : "var(--text-primary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "var(--brand-primary-light)"
                          e.currentTarget.style.color = "var(--text-inverse)"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent"
                          e.currentTarget.style.color = "var(--text-primary)"
                        }
                      }}
                    >
                      <NavLink to={item.url}>
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium ml-3 group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}