import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Heart,
  Wallet,
} from 'lucide-react';

import UserProfile from '@/components/user/UserProfile';
import UserDashboard from '@/components/user/UserDashboard';
import UserEvents from '@/components/user/UserEvents';
import UserBookings from '@/components/user/UserBookings';
import UserWishlist from '@/components/user/UserWishlist';
import UserWallet from '@/components/user/UserWallet';

const tabs = [
  { id: 'profile', label: 'My Profile', icon: User, path: '/my-account' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'events', label: 'My Events', icon: Calendar, path: '/my-events' },
  { id: 'bookings', label: 'My Bookings', icon: BookOpen, path: '/my-bookings' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/my-wishlist' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/my-wallet' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const pathToTab: Record<string, TabId> = {
  '/my-account': 'profile',
  '/dashboard': 'dashboard',
  '/my-events': 'events',
  '/my-bookings': 'bookings',
  '/my-wishlist': 'wishlist',
  '/my-wallet': 'wallet',
};

const UserAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = pathToTab[location.pathname] || 'profile';

  // Redirect to profile if invalid path
  useEffect(() => {
    if (!Object.keys(pathToTab).includes(location.pathname)) {
      navigate('/my-account', { replace: true });
    }
  }, [location.pathname, navigate]);

  const renderContent = () => {
    switch (currentTab) {
      case 'profile':
        return <UserProfile />;
      case 'dashboard':
        return <UserDashboard />;
      case 'events':
        return <UserEvents />;
      case 'bookings':
        return <UserBookings />;
      case 'wishlist':
        return <UserWishlist />;
      case 'wallet':
        return <UserWallet />;
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
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-1 lg:flex-auto items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap 
                  ${
                    currentTab === tab.id
                      ? 'bg-(--brand-primary) text-(--btn-primary-text) shadow-sm'
                      : 'text-(--text-primary) hover:bg-(--bg-tertiary)'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-(--card-bg) border border-(--card-border) shadow-(--card-shadow) min-h-[400px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;