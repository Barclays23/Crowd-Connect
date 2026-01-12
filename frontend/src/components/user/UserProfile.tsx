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




// // frontend/src/components/user/UserProfile.tsx

// import { useEffect, useRef, useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { userServices } from '@/services/userServices';
// import { toast } from 'react-toastify';
// import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
// import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
// import type { UserState } from '@/types/user.types';
// import UserPersonalProfile from './UserPersonalProfile';
// import UserHostProfile from './UserHostProfile';
// import { hostServices } from '@/services/hostServices';

// const UserProfile = () => {
//   const { user: authUser, setUser, isAuthenticated } = useAuth();
//   const [profile, setProfile] = useState<UserState | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Edit states
//   const [editingField, setEditingField] = useState<string | null>(null);
//   const [editFormData, setEditFormData] = useState({
//     name: '',
//     mobile: '',
//     email: '',
//     organizationName: '',
//     registrationNumber: '',
//     businessAddress: '',
//   });
//   const [isUpdatingProfilePic, setIsUpdatingProfilePic] = useState(false);
//   const [isUpdatingBasicInfo, setIsUpdatingBasicInfo] = useState(false);
//   const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
//   const [isUpdatingHostDetails, setIsUpdatingHostDetails] = useState(false);

//   const hasFetchedRef = useRef(false);

//   useEffect(() => {
//     if (!isAuthenticated || hasFetchedRef.current) return;
//     hasFetchedRef.current = true;

//     const fetchUserProfile = async () => {
//       if (!authUser) return;

//       try {
//         setIsLoading(true);
//         setError(null);
//         const response = await userServices.getUserProfile();
//         setProfile(response.userProfile);
//         setUser(response.userProfile);
//         // Initialize form data
//         setEditFormData({
//           name: response.userProfile.name || '',
//           mobile: response.userProfile.mobile || '',
//           email: response.userProfile.email || '',
//           organizationName: response.userProfile.organizationName || '',
//           registrationNumber: response.userProfile.registrationNumber || '',
//           businessAddress: response.userProfile.businessAddress || '',
//         });
//       } catch (err) {
//         const message = getApiErrorMessage(err);
//         setError(message);
//         toast.error(message);
//         console.error('Failed to load profile:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, [isAuthenticated, setUser, authUser]);

//   // Profile Picture Upload
//   const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type and size
//     const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
//     const maxSize = 5 * 1024 * 1024; // 5MB

//     if (!validTypes.includes(file.type)) {
//       toast.error('Please upload a valid image (JPEG, PNG, JPG, GIF)');
//       return;
//     }

//     if (file.size > maxSize) {
//       toast.error('Image size should be less than 5MB');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('profilePic', file);

//     try {
//       setIsUpdatingProfilePic(true);
//       const response = await userServices.updateProfilePicture(formData);
//       setProfile(prev => prev ? { ...prev, profilePic: response.profilePic } : null);
//       setUser(prev => prev ? { ...prev, profilePic: response.profilePic } : null);
//       toast.success('Profile picture updated successfully!');
//     } catch (err) {
//       const message = getApiErrorMessage(err);
//       toast.error(message);
//       console.error('Failed to update profile picture:', err);
//     } finally {
//       setIsUpdatingProfilePic(false);
//       // Clear the file input
//       e.target.value = '';
//     }
//   };

//   // Basic Info Update (Name, Mobile)
//   const handleUpdateBasicInfo = async () => {
//     if (!profile) return;

//     try {
//       setIsUpdatingBasicInfo(true);
//       const updateData = {
//         name: editFormData.name.trim(),
//         mobile: editFormData.mobile.trim() || null,
//       };

//       const response = await userServices.updateUserProfile(updateData);
//       setProfile(prev => prev ? { ...prev, ...updateData } : null);
//       setUser(prev => prev ? { ...prev, ...updateData } : null);
//       setEditingField(null);
//       toast.success('Profile updated successfully!');
//     } catch (err) {
//       const message = getApiErrorMessage(err);
//       toast.error(message);
//       console.error('Failed to update profile:', err);
//     } finally {
//       setIsUpdatingBasicInfo(false);
//     }
//   };

//   // Email Update
//   const handleUpdateEmail = async () => {
//     if (!profile || !editFormData.email.trim()) return;

//     try {
//       setIsUpdatingEmail(true);
//       const response = await authService.updateEmail({ email: editFormData.email.trim() });
      
//       if (response.requiresVerification) {
//         toast.info('Verification email sent. Please check your inbox.');
//       } else {
//         setProfile(prev => prev ? { ...prev, email: editFormData.email.trim() } : null);
//         toast.success('Email updated successfully!');
//       }
//       setEditingField(null);
//     } catch (err) {
//       const message = getApiErrorMessage(err);
//       toast.error(message);
//       console.error('Failed to update email:', err);
//     } finally {
//       setIsUpdatingEmail(false);
//     }
//   };

//   // Host Details Update
//   const handleUpdateHostDetails = async () => {
//     if (!profile) return;

//     try {
//       setIsUpdatingHostDetails(true);
//       const updateData = {
//         organizationName: editFormData.organizationName.trim() || null,
//         registrationNumber: editFormData.registrationNumber.trim() || null,
//         businessAddress: editFormData.businessAddress.trim() || null,
//       };

//       const response = await hostServices.updateHostDetails(updateData);
//       setProfile(prev => prev ? { ...prev, ...updateData } : null);
//       setEditingField(null);
//       toast.success('Host details updated successfully!');
//     } catch (err) {
//       const message = getApiErrorMessage(err);
//       toast.error(message);
//       console.error('Failed to update host details:', err);
//     } finally {
//       setIsUpdatingHostDetails(false);
//     }
//   };

//   // Start editing a field
//   const startEditing = (field: string) => {
//     setEditingField(field);
//   };

//   // Cancel editing
//   const cancelEditing = () => {
//     setEditingField(null);
//     // Reset form data to current profile data
//     if (profile) {
//       setEditFormData({
//         name: profile.name || '',
//         mobile: profile.mobile || '',
//         email: profile.email || '',
//         organizationName: profile.organizationName || '',
//         registrationNumber: profile.registrationNumber || '',
//         businessAddress: profile.businessAddress || '',
//       });
//     }
//   };

//   // Handle form input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({ ...prev, [name]: value }));
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-[70vh] flex items-center justify-center">
//         <LoadingSpinner1 message="Loading your profile..." />
//       </div>
//     );
//   }

//   if (error || !profile) {
//     return (
//       <div className="text-center py-16 text-(--text-secondary)">
//         <p className="text-xl font-medium">Profile could not be loaded</p>
//         <p className="mt-3">{error || 'Something went wrong. Please try again.'}</p>
//       </div>
//     );
//   }

//   const joinedDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
//     day: 'numeric', month: 'short', year: 'numeric'
//   }) : '—';

//   return (
//     <div className="min-h-screen pb-16">
//       <div className="max-w-4xl mx-auto px-5 md:px-0 space-y-8">
//         <UserPersonalProfile
//           profile={profile}
//           isUpdatingProfilePic={isUpdatingProfilePic}
//           editingField={editingField}
//           editFormData={editFormData}
//           isUpdatingBasicInfo={isUpdatingBasicInfo}
//           isUpdatingEmail={isUpdatingEmail}
//           onProfilePicUpload={handleProfilePicUpload}
//           onStartEditing={startEditing}
//           onCancelEditing={cancelEditing}
//           onInputChange={handleInputChange}
//           onUpdateBasicInfo={handleUpdateBasicInfo}
//           onUpdateEmail={handleUpdateEmail}
//           joinedDate={joinedDate}
//         />

//         {profile.role === 'host' && (
//           <UserHostProfile
//             profile={profile}
//             editingField={editingField}
//             editFormData={editFormData}
//             isUpdatingHostDetails={isUpdatingHostDetails}
//             onStartEditing={startEditing}
//             onCancelEditing={cancelEditing}
//             onInputChange={handleInputChange}
//             onUpdateHostDetails={handleUpdateHostDetails}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserProfile;