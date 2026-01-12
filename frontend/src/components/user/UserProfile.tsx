// frontend/src/components/user/UserProfile.tsx

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userServices } from '@/services/userServices';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import type { UserState } from '@/types/user.types';
import { CheckCircle, Edit, Upload } from 'lucide-react';
import DetailItem from '../ui/detail-item';
import { capitalize } from '@/utils/namingConventions';




const UserProfile = () => {
  const { user: authUser, setUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    organizationName: '',
    registrationNumber: '',
    businessAddress: '',
  });
  const [isUpdatingProfilePic, setIsUpdatingProfilePic] = useState(false);
  const [isUpdatingBasicInfo, setIsUpdatingBasicInfo] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingHostDetails, setIsUpdatingHostDetails] = useState(false);

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
        // Initialize form data
        setEditFormData({
          name: response.userProfile.name || '',
          mobile: response.userProfile.mobile || '',
          email: response.userProfile.email || '',
          organizationName: response.userProfile.organizationName || '',
          registrationNumber: response.userProfile.registrationNumber || '',
          businessAddress: response.userProfile.businessAddress || '',
        });
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

  // Profile Picture Upload
  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, JPG, GIF)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      setIsUpdatingProfilePic(true);
      const response = await userServices.updateProfilePicture(formData);
      setProfile(prev => prev ? { ...prev, profilePic: response.profilePic } : null);
      setUser(prev => prev ? { ...prev, profilePic: response.profilePic } : null);
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      const message = getApiErrorMessage(err);
      toast.error(message);
      console.error('Failed to update profile picture:', err);
    } finally {
      setIsUpdatingProfilePic(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  // Basic Info Update (Name, Mobile)
  const handleUpdateBasicInfo = async () => {
    if (!profile) return;

    try {
      setIsUpdatingBasicInfo(true);
      const updateData = {
        name: editFormData.name.trim(),
        mobile: editFormData.mobile.trim() || null,
      };

      const response = await userServices.updateUserProfile(updateData);
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      setUser(prev => prev ? { ...prev, ...updateData } : null);
      setEditingField(null);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const message = getApiErrorMessage(err);
      toast.error(message);
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdatingBasicInfo(false);
    }
  };

  // Email Update
  const handleUpdateEmail = async () => {
    if (!profile || !editFormData.email.trim()) return;

    try {
      setIsUpdatingEmail(true);
      const response = await userServices.updateEmail({ email: editFormData.email.trim() });
      
      if (response.requiresVerification) {
        toast.info('Verification email sent. Please check your inbox.');
      } else {
        setProfile(prev => prev ? { ...prev, email: editFormData.email.trim() } : null);
        toast.success('Email updated successfully!');
      }
      setEditingField(null);
    } catch (err) {
      const message = getApiErrorMessage(err);
      toast.error(message);
      console.error('Failed to update email:', err);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Host Details Update
  const handleUpdateHostDetails = async () => {
    if (!profile) return;

    try {
      setIsUpdatingHostDetails(true);
      const updateData = {
        organizationName: editFormData.organizationName.trim() || null,
        registrationNumber: editFormData.registrationNumber.trim() || null,
        businessAddress: editFormData.businessAddress.trim() || null,
      };

      const response = await userServices.updateHostDetails(updateData);
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      setEditingField(null);
      toast.success('Host details updated successfully!');
    } catch (err) {
      const message = getApiErrorMessage(err);
      toast.error(message);
      console.error('Failed to update host details:', err);
    } finally {
      setIsUpdatingHostDetails(false);
    }
  };

  // Start editing a field
  const startEditing = (field: string) => {
    setEditingField(field);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    // Reset form data to current profile data
    if (profile) {
      setEditFormData({
        name: profile.name || '',
        mobile: profile.mobile || '',
        email: profile.email || '',
        organizationName: profile.organizationName || '',
        registrationNumber: profile.registrationNumber || '',
        businessAddress: profile.businessAddress || '',
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const isHost = profile.role === 'host';
  const joinedDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : '—';

  return (
    <div className="min-h-screen pb-16">
      {/* Profile Header / Hero */}
      <div className="relative mb-10">
        <div className="h-48 md:h-64 bg-gradient-to-br from-(--brand-primary)/20 to-(--bg-secondary) rounded-b-3xl" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 md:px-12 md:pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar with Upload */}
            <div className="relative">
              <div className="relative group">
                {profile.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt={profile.name || 'User'}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-(--bg-primary) shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-(--brand-primary)/15 flex items-center justify-center text-(--brand-primary) text-5xl font-bold border-4 border-(--bg-primary) shadow-xl">
                    {profile.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-(--bg-overlay2) rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicUpload}
                      disabled={isUpdatingProfilePic}
                    />
                    <div className="flex flex-col items-center text-(--text-inverse)">
                      {isUpdatingProfilePic ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--text-inverse)"></div>
                      ) : (
                        <>
                          <Upload className="text-2xl mb-1" />
                          <span className="text-sm">Upload</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              {profile.isEmailVerified && (
                <div className="absolute -bottom-1 -right-1 bg-(--status-success) text-(--text-inverse) text-xs font-bold px-2 py-1 rounded-full border-2 border-(--bg-primary)">
                  <CheckCircle />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-(--heading-primary)">
                {profile.name || 'User'}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-(--text-secondary) text-lg">
                  {profile.email}
                </p>
                {profile.isEmailVerified && (
                  <CheckCircle className="text-(--status-success) text-lg" title="Email verified" />
                )}
              </div>
              <div className="flex gap-5 mt-4 text-sm">
                <div>
                  <span className="text-(--text-secondary)">Role:</span>{' '}
                  <span className="font-medium capitalize text-(--text-primary)">{profile.role}</span>
                </div>
                {isHost && (
                  <div>
                    <span className="text-(--text-secondary)">Host status:</span>{' '}
                    <span className={`font-medium ${
                      profile.hostStatus === 'approved' ? 'text-(--status-success)' :
                      profile.hostStatus === 'rejected' || profile.hostStatus === 'blocked' ? 'text-(--status-error)' :
                      'text-(--badge-warning-text)'
                    }`}>
                      {profile.hostStatus || '—'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="max-w-4xl mx-auto px-5 md:px-0 space-y-8">
        {/* Personal Details Card */}
        <div className="bg-(--bg-tertiary) rounded-2xl border border-(--card-border) p-7 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-(--heading-primary)">
              Personal Details
            </h2>
            <span className="text-sm text-(--text-secondary)">
              Joined {joinedDate}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">Name</label>
              {editingField === 'name' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateBasicInfo}
                      disabled={isUpdatingBasicInfo}
                      className="px-4 py-2 bg-(--btn-primary-bg) text-(--btn-primary-text) rounded-lg hover:bg-(--btn-primary-hover) disabled:opacity-50"
                    >
                      {isUpdatingBasicInfo ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-(--card-border) rounded-lg hover:bg-(--bg-tertiary) text-(--text-primary)"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-(--text-primary)">{profile.name || 'Not provided'}</span>
                  <button
                    onClick={() => startEditing('name')}
                    className="p-1.5 text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--brand-primary)/10 rounded-lg"
                  >
                    <Edit className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">Mobile</label>
              {editingField === 'mobile' ? (
                <div className="space-y-2">
                  <input
                    type="tel"
                    name="mobile"
                    value={editFormData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateBasicInfo}
                      disabled={isUpdatingBasicInfo}
                      className="px-4 py-2 bg-(--btn-primary-bg) text-(--btn-primary-text) rounded-lg hover:bg-(--btn-primary-hover) disabled:opacity-50"
                    >
                      {isUpdatingBasicInfo ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-(--card-border) rounded-lg hover:bg-(--bg-tertiary) text-(--text-primary)"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-(--text-primary)">{profile.mobile || 'Not provided'}</span>
                    {profile.isMobileVerified && (
                      <CheckCircle className="text-(--status-success) text-sm" title="Mobile verified" />
                    )}
                  </div>
                  <button
                    onClick={() => startEditing('mobile')}
                    className="p-1.5 text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--brand-primary)/10 rounded-lg"
                  >
                    <Edit className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">Email</label>
              {editingField === 'email' ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateEmail}
                      disabled={isUpdatingEmail}
                      className="px-4 py-2 bg-(--btn-primary-bg) text-(--btn-primary-text) rounded-lg hover:bg-(--btn-primary-hover) disabled:opacity-50"
                    >
                      {isUpdatingEmail ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-(--card-border) rounded-lg hover:bg-(--bg-tertiary) text-(--text-primary)"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-(--text-primary)">{profile.email}</span>
                    {profile.isEmailVerified && (
                      <CheckCircle className="text-(--status-success) text-sm" title="Email verified" />
                    )}
                  </div>
                  <button
                    onClick={() => startEditing('email')}
                    className="p-1.5 text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--brand-primary)/10 rounded-lg"
                  >
                    <Edit className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {/* Account Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">Account Status</label>
              <span className="font-medium text-(--text-primary)">{capitalize(profile.status)}</span>
            </div>
          </div>
        </div>

        {/* Host Information Card – only if host */}
        {isHost && (
          <div className="bg-(--bg-tertiary) rounded-2xl border border-(--card-border) p-7 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-(--heading-primary)">
                Organization / Host Details
              </h2>
              <button
                onClick={() => startEditing('host')}
                className="px-4 py-2 bg-(--btn-primary-bg) text-(--btn-primary-text) rounded-lg hover:bg-(--btn-primary-hover) transition-colors font-medium"
              >
                Edit Host Details
              </button>
            </div>

            {editingField === 'host' ? (
              <div className="space-y-6">
                {/* Organization Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--text-secondary)">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={editFormData.organizationName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                  />
                </div>

                {/* Registration Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--text-secondary)">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={editFormData.registrationNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                  />
                </div>

                {/* Business Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--text-secondary)">
                    Business Address
                  </label>
                  <textarea
                    name="businessAddress"
                    value={editFormData.businessAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary) resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdateHostDetails}
                    disabled={isUpdatingHostDetails}
                    className="px-6 py-2.5 bg-(--btn-primary-bg) text-(--btn-primary-text) rounded-lg hover:bg-(--btn-primary-hover) disabled:opacity-50 font-medium"
                  >
                    {isUpdatingHostDetails ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-6 py-2.5 border border-(--card-border) rounded-lg hover:bg-(--bg-tertiary) font-medium text-(--text-primary)"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <DetailItem label="Organization Name" value={profile.organizationName || '—'} />
                <DetailItem label="Registration Number" value={profile.registrationNumber || '—'} />
                <DetailItem 
                  label="Business Address" 
                  value={profile.businessAddress || '—'} 
                  isMultiline 
                />

                <div className="pt-4 border-t border-(--card-border)/60">
                  <div className="flex flex-wrap gap-x-10 gap-y-5">
                    <DetailItem 
                      label="Host Status" 
                      value={profile.hostStatus || '—'} 
                      accent={
                        profile.hostStatus === 'approved' ? 'text-(--status-success) font-semibold' :
                        profile.hostStatus === 'rejected' || profile.hostStatus === 'blocked' ? 'text-(--status-error) font-semibold' :
                        'text-(--badge-warning-text) font-semibold'
                      }
                    />
                    {profile.hostAppliedAt && (
                      <DetailItem 
                        label="Applied On" 
                        value={new Date(profile.hostAppliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} 
                      />
                    )}
                    {profile.reviewedAt && (
                      <DetailItem 
                        label="Reviewed On" 
                        value={new Date(profile.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} 
                      />
                    )}
                  </div>
                </div>

                {profile.hostStatus === 'rejected' && profile.hostRejectionReason && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                      Rejection Reason
                    </label>
                    <div className="p-4 bg-(--badge-error-bg) border border-(--badge-error-border) rounded-xl text-(--badge-error-text) text-sm">
                      {profile.hostRejectionReason}
                    </div>
                  </div>
                )}

                {profile.certificateUrl && (
                  <div className="mt-3">
                    <a
                      href={profile.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-(--brand-primary) hover:text-(--brand-primary-hover) font-medium"
                    >
                      <span>View Registration Certificate</span>
                      <span aria-hidden>→</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};



export default UserProfile;