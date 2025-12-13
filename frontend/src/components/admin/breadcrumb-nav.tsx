import { ChevronRight, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pathToTitle: Record<string, string> = {
  "/admin": "Dashboard",
  "/": "Home",
  "/admin/users": "Users",
  "/admin/categories": "Categories", 
  "/admin/host-slabs": "Host Slabs",
  "/admin/events": "Events",
  "/admin/bookings": "Bookings",
}

export function BreadcrumbNav() {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)
  
  return (
    <div className="px-6 py-3 border-b border-[var(--card-border)] bg-[var(--card-bg)]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {pathSegments.length > 0 && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {pathToTitle[location.pathname] || "Unknown Page"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}