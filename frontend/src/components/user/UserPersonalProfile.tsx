// frontend/src/components/user/UserPersonalProfile.tsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Camera, CheckCircle, Edit, Loader2 } from 'lucide-react';
import { userServices, type UserBasicInfo } from '@/services/userServices';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import type { UserState } from '@/types/user.types';
import { capitalize } from '@/utils/namingConventions';
import { authService } from '@/services/authServices';
import { formatDate1 } from '@/utils/dateAndTimeFormats';
import { LoadingSpinner1 } from '../common/LoadingSpinner1';
import { cn } from '@/lib/utils';



interface Props {
   profile: UserState;
   setProfile: React.Dispatch<React.SetStateAction<UserState | null>>;
   setUser: React.Dispatch<React.SetStateAction<UserState | null>>;
}




const UserPersonalProfile = ({ profile, setProfile, setUser }: Props) => {
   const [isUpdatingProfilePic, setIsUpdatingProfilePic] = useState(false);
   
   const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
   const [isUpdatingBasicInfo, setIsUpdatingBasicInfo] = useState(false);

   const [isEditingEmail, setIsEditingEmail] = useState(false);
   const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

   const [editFormData, setEditFormData] = useState({
      name: profile.name || '',
      mobile: profile.mobile || '',
      email: profile.email || '',
   });



   const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
         toast.error('Please upload a valid image (JPEG, PNG, JPG, GIF)');
         return;
      }
      if (file.size > maxSize) {
         toast.error('Image size should be less than 5MB');
         return;
      }

      const formData = new FormData();
      formData.append('profileImage', file);

      try {
         setIsUpdatingProfilePic(true);
         const response = await userServices.updateProfilePicture(formData);
         setProfile((prev) => (prev ? { ...prev, profilePic: response.updatedProfilePic } : null));
         setUser((prev) => (prev ? { ...prev, profilePic: response.updatedProfilePic } : null));
         toast.success(response.message);

      } catch (err) {
         toast.error(getApiErrorMessage(err));

      } finally {
         setIsUpdatingProfilePic(false);
         e.target.value = '';
      }
   };

   const handleUpdateBasicInfo = async () => {
      const updateData: UserBasicInfo = {
         name: editFormData.name.trim(),
         mobile: editFormData.mobile.trim() || undefined,
      };
      
      try {
         setIsUpdatingBasicInfo(true);

         const response = await userServices.editUserBasicInfo(updateData);
         console.log('response in handleUpdateBasicInfo: ', response)

         // setProfile from response.updatedUser 

         setProfile((prev) => (prev ? { ...prev, ...updateData } : null));
         setUser((prev) => (prev ? { ...prev, ...updateData } : null));
         setIsEditingBasicInfo(false);
         toast.success(response.message);

      } catch (err) {
         toast.error(getApiErrorMessage(err));

      } finally {
         setIsUpdatingBasicInfo(false);
      }
   };




   const handleUpdateEmail = async () => {
      if (!editFormData.email.trim()) return;

      try {
         setIsUpdatingEmail(true);

         const response = await authService.requestAuthenticateEmail({ email: editFormData.email.trim() });

         if (response.requiresVerification) {
            toast.info('Verification email sent. Please check your inbox.');
         } else {
            setProfile((prev) => (prev ? { ...prev, email: editFormData.email.trim() } : null));
            toast.success('Email updated successfully!----------');
         }
         setIsEditingEmail(false);

      } catch (err) {
         toast.error(getApiErrorMessage(err));

      } finally {
         setIsUpdatingEmail(false);
      }
   };


   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({ ...prev, [name]: value }));
   };

   const isHost = profile.role === 'host';

   return (
      <>
         {/* Profile Header / Hero */}
         <div className="relative mb-10">
            <div className="h-48 md:h-64 bg-gradient-to-br from-(--brand-primary)/20 to-(--bg-secondary) rounded-3xl" />
               <div className="absolute inset-x-0 bottom-0 px-5 pb-8 md:px-12 md:pb-10">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-5">

                     {/* Avatar with Upload */}
                     <div className="relative">
                     <div
                        className={cn(
                           "relative group",
                           isUpdatingProfilePic && "pointer-events-none"
                        )}
                     >
                        {/* Avatar */}
                        {profile.profilePic ? (
                           <img
                              src={profile.profilePic}
                              alt={profile.name || "User"}
                              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl
                                          object-cover border-4 border-(--bg-primary)
                                          shadow-xl"
                           />
                        ) : (
                           <div
                              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl
                                          bg-(--bg-neutral)
                                          flex items-center justify-center
                                          text-(--brand-primary) text-5xl font-bold
                                          border-4 border-(--bg-primary)
                                          shadow-xl"
                              >
                              {profile.name?.charAt(0)?.toUpperCase() || "?"}
                           </div>
                        )}

                        {/* Avatar Loading Overlay */}
                        {isUpdatingProfilePic && (
                           <div
                              className="absolute inset-0 z-10 rounded-2xl
                                          bg-(--bg-overlay2)
                                          flex items-center justify-center"
                              >
                              <LoadingSpinner1 size="md" />
                           </div>
                        )}

                        {/* Hover Overlay */}
                        <div
                           className="absolute inset-0 rounded-2xl
                                    bg-(--bg-overlay)/80
                                    opacity-0 group-hover:opacity-100
                                    transition-opacity
                                    flex items-center justify-center"
                        >
                           {/* Camera Upload Button */}
                           <label className="absolute -bottom-2 -right-2 cursor-pointer">
                           <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfilePicUpload}
                              disabled={isUpdatingProfilePic}
                           />

                           <div
                              className="w-10 h-10 rounded-full flex items-center justify-center
                                          bg-(--brand-primary)
                                          text-(--text-inverse)
                                          hover:bg-(--brand-primary)/90
                                          shadow-lg border-2 border-(--bg-primary)
                                          transition"
                           >
                              {isUpdatingProfilePic ? (
                                 <Loader2
                                 className="h-4 w-4 animate-spin text-(--text-inverse)"
                                 />
                              ) : (
                                 <Camera size={18} />
                              )}
                           </div>
                           </label>
                        </div>
                     </div>
                     </div>

                     {/* Hero Profile Information */}
                     <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-(--heading-primary)">
                           {profile.name || 'User'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1.5">
                           <p className="text-(--text-secondary) text-lg">{profile.email}</p>
                           {profile.isEmailVerified && (
                              <CheckCircle className="text-(--status-success) text-lg" title="Email verified" />
                           )}
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                           {/* Role */}
                           <div>
                              <span className="text-(--text-secondary)">Role:</span>{' '}
                              <span className="font-medium text-(--text-primary)">
                                 {capitalize(profile.role)}
                              </span>
                           </div>

                           {/* Account Status */}
                           <div>
                              <span className="text-(--text-secondary)">Status:</span>{' '}
                              <span
                                 className={`font-medium ${
                                 profile.status === 'active'
                                    ? 'text-(--status-success)'
                                    : 'text-(--status-error)'
                                 }`}
                              >
                                 {capitalize(profile.status)}
                              </span>
                           </div>

                           {/* Joined On */}
                           <div>
                              <span className="text-(--text-secondary)">Joined:</span>{' '}
                              <span className="font-medium text-(--text-primary)">
                                 {formatDate1(profile.createdAt)}
                              </span>
                           </div>

                           {/* Host Status (only if host) */}
                           {isHost && (
                              <div>
                                 <span className="text-(--text-secondary)">Host status:</span>{' '}
                                 <span
                                 className={`font-medium ${
                                    profile.hostStatus === 'approved'
                                       ? 'text-(--status-success)'
                                       : profile.hostStatus === 'rejected' || profile.hostStatus === 'blocked'
                                       ? 'text-(--status-error)'
                                       : 'text-(--badge-warning-text)'
                                 }`}
                                 >
                                 {capitalize(profile.hostStatus || '—')}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
         </div>

         {/* Personal Details Card */}
         <div className="max-w-4xl mx-auto px-5 md:px-0 space-y-8">
            <div className="bg-(--bg-tertiary) rounded-2xl border border-(--card-border) p-7 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-(--heading-primary)">
                     Personal Details
                  </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info Section - Name & Mobile */}
                  <div className="space-y-2">
                     {/* Header */}
                     <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-(--text-secondary)">
                           Basic Information
                        </h3>

                        {!isEditingBasicInfo && (
                           <button
                           onClick={() => setIsEditingBasicInfo(true)}
                           className="p-1.5 text-(--text-secondary) hover:text-(--brand-primary)
                                       hover:bg-(--brand-primary)/10 rounded-lg"
                           >
                           <Edit size={18} />
                           </button>
                        )}
                     </div>

                     {/* Name */}
                     <div className="space-y-1">
                        <label className="text-sm text-(--text-secondary)">Name</label>
                        {isEditingBasicInfo ? (
                           <input
                              type="text"
                              name="name"
                              value={editFormData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                           />
                        ) : (
                           <p className="font-medium text-(--text-primary)">
                              {profile.name || 'Not provided'}
                           </p>
                        )}
                     </div>

                     {/* Mobile */}
                     <div className="space-y-1">
                        <label className="text-sm text-(--text-secondary)">Mobile</label>
                        {isEditingBasicInfo ? (
                           <input
                           type="tel"
                           name="mobile"
                           value={editFormData.mobile}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-(--form-input-border)
                                       rounded-lg bg-(--form-input-bg)"
                           />
                        ) : (
                           <div className="flex items-center gap-2">
                           <p className="font-medium text-(--text-primary)">
                              {profile.mobile || 'Not provided'}
                           </p>
                           {profile.isMobileVerified && (
                              <CheckCircle className="text-(--status-success)" size={14} />
                           )}
                           </div>
                        )}
                     </div>

                     {/* Basic Info Action Buttons */}
                     {isEditingBasicInfo && (
                        <div className="flex gap-3 pt-3">
                           <button
                              onClick={handleUpdateBasicInfo}
                              disabled={isUpdatingBasicInfo}
                              className="px-5 py-2 bg-(--btn-primary-bg)
                                          text-(--btn-primary-text)
                                          rounded-lg hover:bg-(--btn-primary-hover)
                                          disabled:opacity-50"
                           >
                              {isUpdatingBasicInfo ? 'Saving...' : 'Save'}
                           </button>

                           <button
                              onClick={() => {
                                 setIsEditingBasicInfo(false);
                                 setEditFormData({
                                    name: profile.name || '',
                                    mobile: profile.mobile || '',
                                 });
                              }}
                              className="px-5 py-2 border border-(--card-border)
                                          rounded-lg text-(--text-primary)"
                           >
                              Cancel
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-(--text-secondary)">
                           Email
                        </label>

                        {!isEditingEmail && (
                           <button
                           onClick={() => setIsEditingEmail(true)}
                           className="p-1.5 text-(--text-secondary)
                                       hover:text-(--brand-primary)
                                       hover:bg-(--brand-primary)/10 rounded-lg"
                           >
                           {/* <Edit size={16} /> */}
                           </button>
                        )}
                     </div>

                     {isEditingEmail ? (
                        <div className="space-y-2">
                           <input
                              type="email"
                              name="email"
                              value={editFormData.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                           />

                           <div className="flex gap-2">
                           <button
                              onClick={handleUpdateEmail}
                              disabled={isUpdatingEmail}
                              className="px-4 py-2 bg-(--btn-primary-bg)
                                          text-(--btn-primary-text)
                                          rounded-lg"
                           >
                              {isUpdatingEmail ? 'Saving...' : 'Save'}
                           </button>

                           <button
                              onClick={() => {
                                 setIsEditingEmail(false);
                                 setEditFormData((p) => ({ ...p, email: profile.email }));
                              }}
                              className="px-4 py-2 border rounded-lg"
                           >
                              Cancel
                           </button>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <span className="font-medium">{profile.email}</span>
                           {profile.isEmailVerified && (
                           <CheckCircle size={14} className="text-(--status-success)" />
                           )}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default UserPersonalProfile;