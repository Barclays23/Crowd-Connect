// frontend/src/components/user/UserProfile.tsx

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userServices } from '@/services/userServices';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import type { UserState } from '@/types/user.types';





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
  }, [isAuthenticated, setUser]);



  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner1 message="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12 text-(--text-secondary)">
        <p className="text-lg">Unable to load profile</p>
        <p className="text-sm mt-2">{error || 'Please try again later'}</p>
      </div>
    );
  }

  const isHost = profile.role === 'host';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-(--heading-primary)">
          My Profile
        </h2>

        <button className="px-6 py-2.5 bg-(--brand-primary) text-(--btn-primary-text) rounded-lg hover:bg-(--brand-primary-hover) transition-colors font-medium">
          Edit Profile
        </button>
      </div>

      {/* Main content - two column layout on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <div className="bg-(--bg-secondary) rounded-xl border border-(--card-border) p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-(--heading-primary) mb-5">
              Personal Information
            </h3>

            <div className="space-y-5">
              {/* Profile Picture (optional) */}
              {profile.profilePic ? (
                <div className="flex justify-center mb-4">
                  <img
                    src={profile.profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-(--brand-primary)/30"
                  />
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-(--brand-primary)/10 flex items-center justify-center text-(--brand-primary) text-3xl font-bold">
                    {profile.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>
              )}

              <Field label="Full Name" value={profile.name || '—'} />
              <Field label="Email Address" value={profile.email} />
              <Field label="Mobile Number" value={profile.mobile || 'Not provided'} />
              <Field
                label="Email Verified"
                value={profile.isEmailVerified ? 'Yes' : 'No'}
                valueClassName={profile.isEmailVerified ? 'text-green-600' : 'text-amber-600'}
              />
              {profile.isMobileVerified !== undefined && (
                <Field
                  label="Mobile Verified"
                  value={profile.isMobileVerified ? 'Yes' : 'No'}
                  valueClassName={profile.isMobileVerified ? 'text-green-600' : 'text-amber-600'}
                />
              )}
              <Field label="Account Status" value={profile.status} />
              <Field label="Role" value={profile.role} />
              <Field
                label="Joined"
                value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Host Information (only for hosts) */}
        {isHost && (
          <div className="space-y-6">
            <div className="bg-(--bg-secondary) rounded-xl border border-(--card-border) p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-(--heading-primary) mb-5">
                Host Information
              </h3>

              <div className="space-y-5">
                <Field label="Organization Name" value={profile.organizationName || '—'} />
                <Field
                  label="Registration Number"
                  value={profile.registrationNumber || '—'}
                />
                <Field
                  label="Business Address"
                  value={profile.businessAddress || '—'}
                  multiline
                />

                <Field
                  label="Application Status"
                  value={profile.hostStatus || '—'}
                  valueClassName={
                    profile.hostStatus === 'approved'
                      ? 'text-green-600 font-medium'
                      : profile.hostStatus === 'rejected' || profile.hostStatus === 'blocked'
                      ? 'text-red-600 font-medium'
                      : 'text-amber-600 font-medium'
                  }
                />

                {profile.hostStatus === 'rejected' && profile.hostRejectionReason && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">
                      Rejection Reason
                    </label>
                    <div className="px-4 py-3 rounded-lg bg-red-50/50 border border-red-200 text-red-800 text-sm">
                      {profile.hostRejectionReason}
                    </div>
                  </div>
                )}

                {profile.certificateUrl && (
                  <div>
                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">
                      Registration Certificate
                    </label>
                    <a
                      href={profile.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--brand-primary) hover:underline text-sm inline-flex items-center gap-1.5"
                    >
                      View Certificate →
                    </a>
                  </div>
                )}

                {profile.hostAppliedAt && (
                  <Field
                    label="Applied On"
                    value={new Date(profile.hostAppliedAt).toLocaleDateString()}
                  />
                )}
                {profile.reviewedAt && (
                  <Field
                    label="Reviewed On"
                    value={new Date(profile.reviewedAt).toLocaleDateString()}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit button for mobile - already shown above on desktop */}
      <div className="lg:hidden pt-4">
        <button className="w-full px-6 py-3 bg-(--brand-primary) text-(--btn-primary-text) rounded-lg hover:bg-(--brand-primary-hover) transition-colors font-medium">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

// Reusable field component
type FieldProps = {
  label: string;
  value: string | number | null | undefined;
  multiline?: boolean;
  valueClassName?: string;
};

const Field = ({ label, value, multiline = false, valueClassName = '' }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-(--text-secondary) mb-1">
      {label}
    </label>
    {multiline ? (
      <div className="px-4 py-3 rounded-lg bg-(--bg-secondary) text-(--text-primary) border border-(--card-border) min-h-[80px] whitespace-pre-wrap">
        {value || '—'}
      </div>
    ) : (
      <div
        className={`px-4 py-3 rounded-lg bg-(--bg-secondary) text-(--text-primary) border border-(--card-border) ${valueClassName}`}
      >
        {value || '—'}
      </div>
    )}
  </div>
);

export default UserProfile;