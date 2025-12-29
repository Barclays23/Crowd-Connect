// frontend/src/components/common/Navbar.tsx
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Calendar, Menu, X, LogOut, User } from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'react-toastify';
import UserAvatar from "../ui/userAvatar";





export function Navbar() {
   const [mobileOpen, setMobileOpen] = useState(false);
   const drawerRef = useRef<HTMLDivElement>(null);
   const navigate = useNavigate();

   const { isAuthenticated, logout, user } = useAuth();
   console.log('isAuthenticated:', isAuthenticated);
   

   // Close drawer when clicking outside
   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
            setMobileOpen(false);
         }
      };
      if (mobileOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [mobileOpen]);

   // Close drawer on route change
   const closeDrawer = () => setMobileOpen(false);


   // Prevent body scroll when mobile drawer is open
   useEffect(() => {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
      return () => {
         document.body.style.overflow = "";
      };
   }, [mobileOpen]);



   const handleLogout =  async () => {
      try {
         const response = await logout();
         closeDrawer();
         navigate('/');
         toast.info(response.message);

      } catch (error: any) {
         console.error("Error in handleLogout:", error);
         const errorMessage = error.response?.data?.error || error.response?.data?.message || "Something went wrong while logging out.";
         toast.error(errorMessage);
      }
   }
   

   /* Helper: className for NavLink – active link gets brand-primary color */
   const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
      `text-sm font-medium transition-colors ${
         isActive
         ? "text-[var(--navlink-active)]"
         : "text-[var(--navlink-inactive)] hover:text-[var(--navlink-inactive-hover)]"
   }`;


   // Conditional Navigation Items
    const navItems = [
        { to: "/", label: "Home", end: true },
        { to: "/events", label: "Events" },
        { to: "/host", label: "Host Event", },
        { to: "/bookings", label: "My Bookings", requiresAuth: true }, // Only show if logged in
        { to: "/profile", label: "Profile", requiresAuth: true }, // Only show if logged in
        { to: "/admin", label: "Admin Dashboard", requiresAdmin: true }, // Only show if admin
    ];

    
   

   return (
      <>
         {/* Navbar Header */}
         <header className="border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-primary)]/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4">
               {/* Logo */}
               <Link to="/" className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-[var(--brand-primary)]" />
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                     Crowd Connect
                  </span>
               </Link>

               {/* Desktop Navigation */}
               <nav className="hidden md:flex items-center space-x-6">
                  {/* Conditionally render links based on auth status */}
                  {navItems.map(item => {
                     if (
                        (!item.requiresAuth || isAuthenticated) &&
                        (!item.requiresAdmin || user?.role === "admin")
                     ) {
                        return (
                           <NavLink
                              key={item.to}
                              to={item.to}
                              end={item.end}
                              className={navLinkClasses}
                           >
                              {item.label}
                           </NavLink>
                        );
                     }
                     return null;
                  })}
               </nav>

               {/* Right side – Theme + Auth + Hamburger */}
               <div className="flex items-center space-x-2">
                  <ThemeToggle />

                  {/* Desktop Auth Buttons / Profile & Logout */}
                  <div className="hidden md:flex items-center space-x-3">
                     {isAuthenticated ? (
                        <>
                           <UserAvatar name={user?.name} />

                           <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={handleLogout}
                           >
                              <LogOut className="w-4 h-4 mr-1" />
                              Logout
                           </Button>
                        </>
                     ) : (
                     <>
                           <Button asChild variant="ghost" size="sm">
                              <Link to="/login">
                                 Login
                              </Link>
                           </Button>
                           <Button asChild size="sm">
                              <Link to="/register">Register</Link>
                           </Button>
                     </>
                     )}
                  </div>

                  {/* Mobile Hamburger */}
                  <button
                     onClick={() => setMobileOpen(!mobileOpen)}
                     className="md:hidden p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                     aria-label="Toggle menu"
                  >
                     {mobileOpen ? (
                     <X className="h-5 w-5" />
                     ) : (
                     <Menu className="h-5 w-5" />
                     )}
                  </button>
               </div>
            </div>
         </header>


         {/* Mobile Drawer – slides in from the left */}
         <div
            ref={drawerRef}
            className={`fixed inset-y-0 left-0 w-64 z-50 bg-[var(--bg-primary)] border-r border-[var(--border-default)] transform transition-transform duration-300 ease-in-out md:hidden ${
               mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
         >
            <div className="flex flex-col h-full">
               {/* Drawer Header */}
               <div className="flex items-center justify-between p-4.5 border-b border-[var(--border-default)]">
                  <Link to="/" className="flex items-center space-x-2" onClick={closeDrawer}>
                  <Calendar className="h-7 w-7 text-[var(--brand-primary)]" />
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                     Crowd Connect
                  </span>
                  </Link>
                  <button
                  onClick={closeDrawer}
                  className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                  >
                  <X className="h-5 w-5" />
                  </button>
               </div>

               {/* Drawer Content */}
               <div className="flex flex-col flex-1 min-h-0">
                  {/* Drawer Auth – Avatar + Logout */}
                  <div className="p-2 space-y-2 border-b border-[var(--border-default)]">
                     {isAuthenticated ? (
                        <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                              <UserAvatar name={user?.name} />
                              <span className="text-sm font-medium text-[var(--text-primary)]">
                                 {user?.name || "User"}
                              </span>
                           </div>
                           <Button variant="destructive" size="sm" onClick={handleLogout}>
                              <LogOut className="w-4 h-4" />
                           </Button>
                        </div>
                     ) : (
                        <>
                           <Button asChild className="w-full" size="sm">
                              <Link 
                                 to="/login" 
                                 onClick={closeDrawer}
                                 className="bg-[var(--brand-primary)] text-[var(--btn-primary-text)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--brand-primary)]"
                              >
                                 Login
                              </Link>
                           </Button>
                           <Button asChild variant="outline" className="w-full" size="sm">
                              <Link 
                                 to="/register" 
                                 onClick={closeDrawer}
                                 className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                              >
                                 Register
                              </Link>
                           </Button>
                        </>
                     )}
                  </div>

                  {/* Drawer Nav Links */}
                  <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
                     {/* Conditionally render mobile links */}
                     {navItems.map((item) => {
                        if (
                           (!item.requiresAuth || isAuthenticated) &&
                           (!item.requiresAdmin || user?.role === "admin")
                        ) {
                           return (
                              <NavLink
                              key={item.to}
                              to={item.to}
                              end={item.end}
                              className={({ isActive }) =>
                                 `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                    isActive
                                    ? "bg-[var(--bg-tertiary)] text-[var(--brand-primary)]"
                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--brand-primary)]"
                                 }`
                              }
                              onClick={closeDrawer}
                              >
                              {item.label}
                              </NavLink>
                           );
                        }
                        return null;
                     })}
                  </nav>
               </div>
            </div>
         </div>


         {/* Backdrop – darkens the rest of the page when drawer is open */}
         {mobileOpen && (
            <div
               className="fixed inset-0 bg-black/50 z-40 md:hidden"
               onClick={closeDrawer}
            />
         )}
      </>
   );
}