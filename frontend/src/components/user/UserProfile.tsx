// frontend/src/components/user/UserProfile.tsx
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userServices } from '@/services/userServices';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import type { UserState } from '@/types/user.types';

import UserPersonalProfile from './UserPersonalProfile';
import UserHostProfile from './UserHostProfile';

const UserProfile = () => {
  const { user: authUser, setUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchUserProfile = async () => {
      if (!authUser) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await userServices.getUserProfile();
        setProfile(response.userProfile);
        setUser(response.userProfile);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        toast.error(message);
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, setUser, authUser]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner1 message="Loading your profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-16 text-(--text-secondary)">
        <p className="text-xl font-medium">Profile could not be loaded</p>
        <p className="mt-3">{error || 'Something went wrong. Please try again.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-5 md:px-0 space-y-8">
        <UserPersonalProfile 
          profile={profile} 
          setProfile={setProfile}
          setUser={setUser}
        />

{/* Temporarily Not Showing in UI. Will show later. */}
        {/* {profile.role === 'host' && (
          <UserHostProfile 
            profile={profile} 
            setProfile={setProfile}
          />
        )} */}
      </div>
    </div>
  );
};

export default UserProfile;