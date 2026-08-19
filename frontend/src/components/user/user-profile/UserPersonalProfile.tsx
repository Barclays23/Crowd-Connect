// frontend/src/components/user/user-profile/UserPersonalProfile.tsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Camera, CheckCircle, Edit, KeyRound, Loader2 } from 'lucide-react';
import { userServices } from '@/services/userServices';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { ProfilePicUpdateData, UserBasicInfoPayload, UserState } from '@/types/user.types';
import { capitalize } from '@/utils/namingConventions';
import { authService } from '@/services/authServices';
import { formatDate1 } from '@/utils/dateAndTime.utils';
import { LoadingSpinner1 } from '../../shared/LoadingSpinner1';
import { cn } from '@/lib/utils';
import { 
   emailBase, 
   profilePicUploadSchema, 
   updateBasicInfoSchema 
} from '@/schemas/user.schema';
import { FieldError } from '@/components/shared/FieldError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChangePassword from '@/components/auth/ChangePassword';
import type { AuthEmailRequestData } from '@/types/auth.types';
import type { ApiResponse } from '@/types/common.types';
import { Tooltip } from '@/components/shared/Tooltip';

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

   const [showChangePassword, setShowChangePassword] = useState(false);

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
         const response: ApiResponse<ProfilePicUpdateData> = await userServices.updateProfilePicture(formData);

         setProfile((prev) => (prev ? { ...prev, profilePic: response.data.profilePic } : null));
         setUser((prev) => (prev ? { ...prev, profilePic: response.data.profilePic } : null));

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
      const updateData: UserBasicInfoPayload = {
         ...validation.data,
         name: validation.data.name.trim(),
      };

      try {
         setIsUpdatingBasicInfo(true);

         const response: ApiResponse<UserBasicInfoPayload> = await userServices.editUserBasicInfo(updateData);
         console.log('response in handleUpdateBasicInfo: ', response)

         setProfile(prev => prev ? { ...prev, ...response.data } : null);
         setUser(prev => prev ? { ...prev, ...response.data } : null);
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

         const response: ApiResponse<AuthEmailRequestData> = await authService.requestAuthenticateEmail({ email });

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
         {/* ── Profile Header / Hero ──────────────────────────────────────── */}
         <div className="mb-8 md:mb-12">
            {/* Banner Container: Restored original height proportion while keeping flexbox safety */}
            <div className="flex flex-col justify-end min-h-56 md:min-h-64 bg-linear-to-tl from-(--brand-primary)/20 to-(--bg-secondary) rounded-2xl md:rounded-3xl border-2 border-(--border-focus) w-full px-5 pb-6 pt-12 md:px-10 md:pb-10">
               
               <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5 md:gap-6 w-full">

                  {/* Avatar with Upload */}
                  <div className="relative shrink-0 self-start sm:self-auto">
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
                              referrerPolicy="no-referrer"
                              className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl
                                 object-cover border-4 border-(--bg-primary)
                                 shadow-xl bg-(--bg-primary)"
                           />
                        ) : (
                           <div
                              className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl
                                 bg-(--bg-neutral)
                                 flex items-center justify-center
                                 text-(--brand-primary) text-3xl md:text-5xl font-bold
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
                                 className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                                    bg-(--brand-primary)
                                    text-(--text-inverse)
                                    hover:bg-(--brand-primary)/90
                                    shadow-lg border-2 border-(--bg-primary)
                                    transition"
                              >
                                 {isUpdatingProfilePic ? (
                                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-(--text-inverse)" />
                                 ) : (
                                    <Tooltip content="Choose File" side="top">
                                       <Camera className="w-4 h-4 md:w-4.5 md:h-4.5" />
                                    </Tooltip>
                                 )}
                              </div>
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Hero Profile Information */}
                  <div className="flex-1 pb-1 md:pb-2">
                     <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--heading-primary) truncate">
                        {profile.name || 'User'}
                     </h1>
                     <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1.5">
                        <p className="text-(--text-secondary) text-sm sm:text-base md:text-lg truncate">
                           {profile.email}
                        </p>
                        {profile.isEmailVerified && (
                           <span title="Email verified" className="shrink-0">
                              <CheckCircle className="text-(--status-success) w-4 h-4 md:w-5 md:h-5" />
                           </span>
                        )}
                     </div>

                     <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1 md:gap-y-2 mt-2 md:mt-4 text-xs md:text-sm">
                        {/* Role */}
                        <div>
                           <span className="font-medium text-(--brand-primary-light)">Role:</span>{' '}
                           <span className="font-medium text-(--text-primary)">
                              {capitalize(profile.role)}
                           </span>
                        </div>

                        {/* Account Status */}
                        <div>
                           <span className="font-medium text-(--brand-primary-light)">Status:</span>{' '}
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
                           <span className="font-medium text-(--brand-primary-light)">Joined:</span>{' '}
                           <span className="font-medium text-(--text-primary)">
                              {formatDate1(profile.createdAt)}
                           </span>
                        </div>

                        {/* Host Status (only if host) */}
                        {isHost && (
                           <div>
                              <span className="font-medium text-(--brand-primary-light)">Host status:</span>{' '}
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

         {/* ── Personal Details Card ──────────────────────────────────────── */}
         <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="bg-linear-to-tl from-(--brand-primary)/20 to-(--bg-secondary) rounded-2xl border-2 border-(--border-focus) p-5 md:p-7 shadow-sm">
               <div className="flex justify-between items-center mb-5 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-(--heading-primary)">
                     Personal Details
                  </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Basic Info Section - Name & Mobile */}
                  <div className="space-y-3">
                     {/* Header */}
                     <div className="flex items-center justify-between">
                        <h3 className="text-xs md:text-sm font-medium text-(--heading-secondary) uppercase tracking-wide">
                           Basic Information
                        </h3>

                        {!isEditingBasicInfo && (
                           <Tooltip content="Edit Basic Info" side="top">
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-8 w-8 md:h-9 md:w-9 p-0"
                                 onClick={() => setIsEditingBasicInfo(true)}
                              >
                                 <Edit className="w-4 h-4 md:w-4.5 md:h-4.5" />
                              </Button>
                           </Tooltip>
                        )}
                     </div>

                     {/* Name */}
                     <div className="space-y-1 md:space-y-1.5">
                        <label className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Name</label>
                        {isEditingBasicInfo ? (
                           <Input
                              type="text"
                              name="name"
                              value={editFormData.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                           />
                        ) : (
                           <p className="text-sm md:text-base font-medium text-(--text-primary)">
                              {profile.name || 'Not provided'}
                           </p>
                        )}
                        <FieldError message={basicInfoErrors.name} />
                     </div>

                     {/* Mobile */}
                     <div className="space-y-1 md:space-y-1.5">
                        <label className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Mobile</label>
                        {isEditingBasicInfo ? (
                           <Input
                              type="tel"
                              name="mobile"
                              value={editFormData.mobile}
                              onChange={handleInputChange}
                              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                           />
                        ) : (
                           <div className="flex items-center gap-2">
                              <p className="text-sm md:text-base font-medium text-(--text-primary)">
                                 {profile.mobile || 'Not provided'}
                              </p>
                              {profile.isMobileVerified && (
                                 <CheckCircle className="text-(--status-success) w-3.5 h-3.5 md:w-4 md:h-4" />
                              )}
                           </div>
                        )}
                        <FieldError message={basicInfoErrors.mobile} />
                     </div>

                     {/* Basic Info Action Buttons */}
                     {isEditingBasicInfo && (
                        <div className="flex gap-2.5 pt-2">
                           <Button
                              size="sm"
                              onClick={handleUpdateBasicInfo}
                              disabled={isUpdatingBasicInfo}
                              className="text-xs md:text-sm"
                           >
                              {isUpdatingBasicInfo ? 'Saving...' : 'Save'}
                           </Button>

                           <Button
                              variant="outline"
                              size="sm"
                              className="text-xs md:text-sm"
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
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <label className="text-xs md:text-sm font-medium text-(--brand-primary-light) uppercase tracking-wide">
                           Email Identity
                        </label>

                        {!profile.isEmailVerified && !isEditingEmail && (
                           <Tooltip content="Edit Email" side="top">
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-8 w-8 md:h-9 md:w-9 p-0"
                                 onClick={() => setIsEditingEmail(true)}
                              >
                                 <Edit className="w-4 h-4 md:w-4.5 md:h-4.5" />
                              </Button>
                           </Tooltip>
                        )}
                     </div>

                     {isEditingEmail ? (
                        <div className="space-y-2">
                           <Input
                              type="email"
                              name="email"
                              value={editFormData.email}
                              onChange={handleInputChange}
                              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                           />
                           <FieldError message={emailError} />

                           <div className="flex gap-2.5 pt-1">
                           <Button
                              size="sm"
                              onClick={handleUpdateEmail}
                              disabled={isUpdatingEmail}
                              className="text-xs md:text-sm"
                           >
                              {isUpdatingEmail ? 'Saving...' : 'Save'}
                           </Button>

                           <Button
                              variant="outline"
                              size="sm"
                              className="text-xs md:text-sm"
                              onClick={() => {
                                 setIsEditingEmail(false);
                                 setEmailError(undefined);
                                 setEditFormData((p) => ({ ...p, email: profile.email }));
                              }}
                           >
                              Cancel
                           </Button>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-sm md:text-base font-medium text-(--text-primary) break-all">
                              {profile.email}
                           </span>
                           {profile.isEmailVerified && (
                              <CheckCircle className="text-(--status-success) w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                           )}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* ── Change Password ──────────────────────────────────────── */}
            {!showChangePassword ? (
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4
                  bg-(--bg-tertiary) rounded-2xl
                  border-2 border-(--border-focus)
                  px-5 md:px-7 py-4 md:py-5 shadow-sm"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center
                        bg-(--brand-primary)/10 text-(--brand-primary)"
                     >
                        <KeyRound className="w-4 h-4 md:w-5 md:h-5" />
                     </div>
                     <div>
                        <p className="text-sm md:text-base font-medium text-(--brand-primary-light)">Password</p>
                        <p className="text-xs md:text-sm text-(--text-secondary)">
                           Update your account password
                        </p>
                     </div>
                  </div>
 
                  <Button
                     variant="outline"
                     size="sm"
                     className="w-full sm:w-auto text-xs md:text-sm md:px-4 md:py-2"
                     onClick={() => setShowChangePassword(true)}
                  >
                     Change Password
                  </Button>
               </div>
            ) : (
               <ChangePassword onCancel={() => setShowChangePassword(false)} />
            )}
         </div>
      </>
   );
};

export default UserPersonalProfile;