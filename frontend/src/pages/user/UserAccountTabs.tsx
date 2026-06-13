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
} from 'lucide-react';

import UserProfile from '@/components/user/UserProfile';
import UserDashboard from '@/components/user/UserDashboard';
import UserEvents from '@/components/user/UserEvents';
import UserBookings from '@/components/user/UserBookings';
import UserWishlist from '@/components/user/UserWishlist';
import UserWallet from '@/components/user/UserWallet';
import UserPayouts from '@/components/user/UserPayouts';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const ALL_TABS = [
  { id: 'profile',    label: 'My Profile',  icon: User,             path: '/my-account' },
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard,  path: '/dashboard' },
  { id: 'events',     label: 'My Events',   icon: Calendar,         path: '/my-events' },
  { id: 'bookings',   label: 'My Bookings', icon: BookOpen,         path: '/my-bookings' },
  { id: 'wishlist',   label: 'Wishlist',    icon: Heart,            path: '/my-wishlist' },
  { id: 'wallet',     label: 'Wallet',      icon: Wallet,           path: '/my-wallet' },
  { id: 'payouts',    label: "Payouts",     icon: IndianRupee,      path: "/my-payouts" }
] as const;

type TabId = (typeof ALL_TABS)[number]['id'];

const pathToTab: Record<string, TabId> = {
  '/my-account'   : 'profile',
  '/dashboard'    : 'dashboard',
  '/my-events'    : 'events',
  '/my-bookings'  : 'bookings',
  '/my-wishlist'  : 'wishlist',
  '/my-wallet'    : 'wallet',
  "/my-payouts"   : 'payouts'
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
      case 'wishlist':
        return <UserWishlist />;
      case 'wallet':
        return <UserWallet />;
      case 'payouts':
        return isHost ? <UserPayouts /> : <UserProfile />;
      default:
        return <UserProfile />;
    }
  };


  return (
    <div className="min-h-screen bg p-6 md:p-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Tabs - horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex rounded-full p-1.5 bg-(--bg-secondary) min-w-max lg:min-w-0">
            {visibleTabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                variant={currentTab === tab.id ? "default" : "ghost"}
                className={`flex-1 lg:flex-auto rounded-full h-auto px-5 py-2.5 ${
                  currentTab === tab.id
                    ? "bg-(--brand-primary) shadow-sm"
                    : "text-(--text-primary) border border-transparent hover:bg-(--bg-tertiary) hover:text-(--brand-primary-light) hover:border-(--brand-primary-light)"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-(--card-bg) border border-(--card-border) shadow-(--card-shadow) min-h-100">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserAccountTabs;