// frontend/src/pages/user/UserAccountTabs.tsx
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Heart,
  Wallet,
  IndianRupee,
  Star,
} from 'lucide-react';

import UserProfile from '@/components/user/user-profile/UserProfile';
import UserDashboard from '@/components/user/user-dashboard/UserDashboard';
import UserEvents from '@/components/user/user-events/UserEvents';
import UserBookings from '@/components/user/user-bookings/UserBookings';
import UserWallet from '@/components/user/user-wallet/UserWallet';
import UserPayouts from '@/components/user/user-payouts/UserPayouts';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserFavourites from '@/components/user/user-favourites/UserFavourites';
import UserReviews from '@/components/user/user-reviews/UserReviews';



const ALL_TABS = [
   { id: 'profile',    label: 'Profile',         icon: User,             path: '/my-account' },
   { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard,  path: '/dashboard' },
   { id: 'events',     label: 'Hosted Events',   icon: Calendar,         path: '/my-events' },
   { id: 'bookings',   label: 'Bookings',        icon: BookOpen,         path: '/my-bookings' },
   { id: 'favourites', label: 'Favourites',      icon: Heart,            path: '/my-favourites' },
   { id: 'wallet',     label: 'Wallet',          icon: Wallet,           path: '/my-wallet' },
   { id: 'payouts',    label: "Payouts",         icon: IndianRupee,      path: "/my-payouts" },
   { id: 'reviews',    label: 'My Reviews',      icon: Star,             path: '/my-reviews' },
] as const;


type TabId = (typeof ALL_TABS)[number]['id'];



const pathToTab: Record<string, TabId> = {
   '/my-account'     : 'profile',
   '/dashboard'      : 'dashboard',
   '/my-events'      : 'events',
   '/my-bookings'    : 'bookings',
   '/my-favourites'  : 'favourites',
   '/my-wallet'      : 'wallet',
   "/my-payouts"     : 'payouts',
   "/my-reviews"     : 'reviews'
};




const UserAccountTabs = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { user } = useAuth();

   const isHost = user?.role === 'host';

   const currentTab = pathToTab[location.pathname] || 'profile';

   const visibleTabs = useMemo(() => {
      return ALL_TABS.filter(tab => {
         if (!isHost && 
         (
            tab.id === 'events' || 
            tab.id === 'payouts'
         )) {
         return false;
         }
         return true;
      });
   }, [isHost]);


   // Prevent direct URL access to restricted tabs (redirect to Profile)
   useEffect(() => {
      const isValidPath = Object.keys(pathToTab).includes(location.pathname);
      const targetTabId = pathToTab[location.pathname];
      const isRestrictedTab = targetTabId === 'events' || targetTabId === 'payouts';

      // If path is invalid OR user tries to access a host tab without being a host
      if (!isValidPath || (isRestrictedTab && !isHost)) {
         navigate('/my-account', { replace: true });
      }
   }, [location.pathname, navigate, isHost]);


   const renderContent = () => {
      switch (currentTab) {
         case 'profile':
         return <UserProfile />;

         case 'dashboard':
         return <UserDashboard />;

         case 'events':
         return isHost ? <UserEvents /> : <UserProfile />;

         case 'bookings':
         return <UserBookings />;

         case 'favourites':
         return <UserFavourites />;

         case 'reviews':
         return <UserReviews />;

         case 'wallet':
         return <UserWallet />;

         case 'payouts':
         return isHost ? <UserPayouts /> : <UserProfile />;

         default:
         return <UserProfile />;
      }
   };


   return (
      <div className="min-h-screen bg pt-3 pb-10 p-1 sm:pt-5 sm:pb-10 md:p-5 md:pb-10 lg:p-8 lg:pb-20 bg-animated-gradient1">
         <div className="w-full mx-auto px-1 sm:px-1 md:px-2 lg:px-8 max-w-7xl">

            {/* Tabs
               Same icon-on-top card style at every breakpoint:
               - Mobile: 4-col grid, wraps to as many rows as needed.
               - sm and up: one row, each tab sharing the width equally.
               Scales up size/spacing per breakpoint; adds hover lift + icon pop + active glow. */}
            <div className="rounded-2xl p-1.5 sm:p-2 bg-(--bg-secondary)">
               <div className="grid grid-cols-4 sm:flex gap-1.5 sm:gap-2">
                  {visibleTabs.map((tab) => (
                  <Button
                     key={tab.id}
                     onClick={() => navigate(tab.path)}
                     variant={currentTab === tab.id ? "default" : "ghost"}
                     className={`group relative flex flex-col sm:flex-1 items-center justify-center
                        min-w-0
                        gap-0.5 sm:gap-1
                        h-auto min-h-14 sm:min-h-16 md:min-h-18
                        px-1 py-1.5 sm:px-2 sm:py-2.5 md:px-3 md:py-3 lg:px-4 lg:py-3.5
                        rounded-xl
                        text-[10px] sm:text-xs md:text-xs leading-tight text-center
                        whitespace-normal wrap-break-word
                        transition-all duration-200 ease-out
                        hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary-light) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-secondary)
                        ${
                        currentTab === tab.id
                        ? "bg-(--brand-primary) shadow-lg shadow-(--brand-primary)/30"
                        : "text-(--text-primary) border border-transparent hover:bg-(--bg-tertiary) hover:text-(--brand-primary-light) hover:border-(--brand-primary-light) hover:shadow-md"
                     }`}
                  >
                     <tab.icon
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 shrink-0
                           transition-transform duration-200
                           group-hover:-translate-y-0.5 group-hover:scale-110"
                     />
                     <span className="text-center">{tab.label}</span>
                  </Button>
                  ))}
               </div>
            </div>

            {/* Content Area */}
            <div className="min-h-100 mt-4 sm:mt-6 lg:mt-8 p-2 sm:p-4 md:p-6 rounded-2xl 
               bg-(--card-bg) bg-linear-to-br from-(--brand-primary)/50 to-(--brand-primary-dark) 
               border border-(--card-border) shadow-(--card-shadow)">
               {renderContent()}
            </div>
         </div>
      </div>
   );
};

export default UserAccountTabs;