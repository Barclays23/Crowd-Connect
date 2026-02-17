// frontend/src/components/user/UserPersonalProfile.tsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Camera, CheckCircle, Edit, Loader2 } from 'lucide-react';
import { userServices, type UserBasicInfo } from '@/services/userServices';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { UserState } from '@/types/user.types';
import { capitalize } from '@/utils/namingConventions';
import { authService } from '@/services/authServices';
import { formatDate1 } from '@/utils/dateAndTimeFormats';
import { LoadingSpinner1 } from '../common/LoadingSpinner1';
import { cn } from '@/lib/utils';
import { MAX_FILE_SIZE } from '@/schemas/host.schema';
import { ACCEPTED_IMAGE_TYPES, emailBase, MAX_IMAGE_SIZE, profilePicUploadSchema, updateBasicInfoSchema } from '@/schemas/user.schema';
import { FieldError } from '@/components/ui/FieldError';
import { Button } from '@/components/ui/button';



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

   const [emailError, setEmailError] = useState<string | undefined>();
   const [basicInfoErrors, setBasicInfoErrors] = useState<{
      name?: string;
      mobile?: string;
   }>({});


   const [editFormData, setEditFormData] = useState({
      name: profile.name || '',
      mobile: profile.mobile || '',
      email: profile.email || '',
   });


   const isHost = profile.role === 'host';


   const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = profilePicUploadSchema.safeParse({
         profileImage: file,
      });

      
      if (!validation.success) {
         toast.error(validation.error.issues[0].message);
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
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);

      } finally {
         setIsUpdatingProfilePic(false);
         e.target.value = '';
      }
   };


   const handleUpdateBasicInfo = async () => {
      const validation = updateBasicInfoSchema.safeParse({
         name: editFormData.name,
         mobile: editFormData.mobile,
      });

      if (!validation.success) {
         const fieldErrors: typeof basicInfoErrors = {};

         validation.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof typeof fieldErrors;
            if (!fieldErrors[field]) {
               fieldErrors[field] = issue.message;
            }
         });

         setBasicInfoErrors(fieldErrors);
         return;
      }

      setBasicInfoErrors({});
      const updateData: UserBasicInfo = {
         ...validation.data,
         name: validation.data.name.trim(),
      };

      try {
         setIsUpdatingBasicInfo(true);

         const response = await userServices.editUserBasicInfo(updateData);
         console.log('response in handleUpdateBasicInfo: ', response)

         setProfile(prev => prev ? { ...prev, ...response.updatedUser } : null);
         setUser(prev => prev ? { ...prev, ...response.updatedUser } : null);
         setIsEditingBasicInfo(false);

         toast.success(response.message);

      } catch (err) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);

      } finally {
         setIsUpdatingBasicInfo(false);
      }
   };



   const handleUpdateEmail = async () => {
      const validation = emailBase.safeParse(editFormData.email);

      if (!validation.success) {
         setEmailError(validation.error.issues[0].message);
         return;
      }

      setEmailError(undefined);
      const email = validation.data;

      try {
         setIsUpdatingEmail(true);

         const response = await authService.requestAuthenticateEmail({ email });

         toast.info(response.message);

         setIsEditingEmail(false);

      } catch (err) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);

      } finally {
         setIsUpdatingEmail(false);
      }
   };


   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "name" || name === "mobile") {
         setBasicInfoErrors(prev => ({ ...prev, [name]: undefined }));
      }

      if (name === "email") {
         setEmailError(undefined);
      }
   };


   return (
      <>
         {/* Profile Header / Hero */}
         <div className="relative mb-10">
            <div className="h-48 md:h-64 bg-linear-to-br from-(--brand-primary)/20 to-(--bg-secondary) rounded-3xl" />
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
                              <span title="Email verified">
                                 <CheckCircle className="text-(--status-success)" size={20}/>
                              </span>
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
                           <Button
                              variant="ghost"
                              onClick={() => setIsEditingBasicInfo(true)}
                           >
                              <Edit size={18} />
                           </Button>
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
                        <FieldError message={basicInfoErrors.name} />
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
                        <FieldError message={basicInfoErrors.mobile} />
                     </div>

                     {/* Basic Info Action Buttons */}
                     {isEditingBasicInfo && (
                        <div className="flex gap-3 pt-3">
                           <Button
                              onClick={handleUpdateBasicInfo}
                              disabled={isUpdatingBasicInfo}
                           >
                              {isUpdatingBasicInfo ? 'Saving...' : 'Save'}
                           </Button>

                           <Button
                              variant="outline"
                              onClick={() => {
                                 setIsEditingBasicInfo(false);
                                 setBasicInfoErrors({});
                                 setEditFormData({
                                    name: profile.name || '',
                                    mobile: profile.mobile || '',
                                    email: profile.email || ''
                                 });
                              }}
                           >
                              Cancel
                           </Button>
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
                           <Button
                              variant='ghost'
                              onClick={() => setIsEditingEmail(true)}
                           >
                              {/* <Edit size={18} /> */}
                           </Button>
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
                           <FieldError message={emailError} />

                           <div className="flex gap-2">
                           <Button
                              onClick={handleUpdateEmail}
                              disabled={isUpdatingEmail}
                           >
                              {isUpdatingEmail ? 'Saving...' : 'Save'}
                           </Button>

                           <Button
                              variant="outline"
                              onClick={() => {
                                 setIsEditingEmail(false);
                                 setEmailError(undefined);
                                 setEditFormData((p) => ({ ...p, email: profile.email }));
                              }}
                              className="px-4 py-2 border rounded-lg"
                           >
                              Cancel
                           </Button>
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