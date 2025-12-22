// frontend/src/components/admin/admin-navbar.tsx

import { Search, Bell, User, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HamburgerTrigger, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/namingConventions";





export function AdminNavbar() {
  const {user} = useAuth();

  return (
    <header className="w-full border-b border-[var(--border-default)] bg-[var(--card-bg)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--card-bg)]/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">

        {/* Left: Mobile Hamburger Trigger */}
        <div className="flex items-center gap-4">
          <HamburgerTrigger className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Global Search (Desktop) */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="w-72 pl-10 pr-4 h-10 rounded-xl bg-[var(--bg-secondary)] border-[var(--border-muted)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-light)]"
            />
          </div>

          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle/>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-[var(--bg-secondary)]">
            <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold bg-[var(--brand-primary)] text-white border-2 border-[var(--card-bg)] p-0"
            >
              3
            </Badge>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[var(--brand-primary-light)] transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                  <AvatarFallback className="bg-[var(--brand-primary)] text-white font-semibold text-sm">
                    {user ? getInitials(user.name ?? "") : "AD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 p-3 shadow-[var(--shadow-lg)] border-[var(--border-strong)]">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-semibold text-[var(--heading-primary)]">Admin User</p>
                  <p className="text-xs text-[var(--text-secondary)]">admin@crowdconnect.com</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-[var(--border-muted)]" />

              <DropdownMenuItem className="cursor-pointer hover:bg-[var(--bg-secondary)] rounded-lg">
                <User className="mr-3 h-4 w-4 text-[var(--text-secondary)]" />
                <span>Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer hover:bg-[var(--bg-secondary)] rounded-lg">
                <Settings className="mr-3 h-4 w-4 text-[var(--text-secondary)]" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[var(--border-muted)]" />

              <DropdownMenuItem className="cursor-pointer text-[var(--status-error)] hover:bg-[var(--status-error-bg)] rounded-lg font-medium">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}