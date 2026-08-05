// frontend/src/components/user/UserHostProfile.tsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Camera, Edit, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { UserState } from '@/types/user.types';
import type { ApiResponse } from '@/types/common.types';
import DetailItem from '../ui/detail-item';
import { capitalize } from '@/utils/namingConventions';
import { formatDate1 } from '@/utils/dateAndTimeFormats';
import { hostServices } from '@/services/hostServices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/common/ToolTip';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import { profilePicUploadSchema } from '@/schemas/user.schema';
import { StarRating } from '@/components/common/StarRating';


interface Props {
   profile: UserState;
   setProfile: React.Dispatch<React.SetStateAction<UserState | null>>;
}


const UserHostProfile = ({ profile, setProfile }: Props) => {
   const [isEditing, setIsEditing] = useState(false);
   const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
   const [editFormData, setEditFormData] = useState({
      organizationName: profile.organizationName || '',
      registrationNumber: profile.registrationNumber || '',
      businessAddress: profile.businessAddress || '',
      organizationDescription: profile.organizationDescription || '',
   });
   const [isUpdatingHostDetails, setIsUpdatingHostDetails] = useState(false);

   // Handle Logo Upload (similar logic to UserPersonalProfile)
   const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = profilePicUploadSchema.safeParse({
         profileImage: file, // Re-using schema for validation rules (size/type)
      });

      if (!validation.success) {
         toast.error(validation.error.issues[0].message);
         return;
      }

      const formData = new FormData();
      formData.append('organizationLogo', file);

      try {
         setIsUpdatingLogo(true);
         const response: ApiResponse<UserState> = await hostServices.updateHostLogo(formData);

         setProfile((prev) => (prev ? { ...prev, organizationLogo: response.data.organizationLogo } : null));
         toast.success('Organization logo updated successfully!');

      } catch (err) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);

      } finally {
         setIsUpdatingLogo(false);
         e.target.value = ''; // Reset file input
      }
   };

   const handleUpdateHostDetails = async () => {
      try {
         setIsUpdatingHostDetails(true);
         const updateData: FormData = new FormData();
         updateData.append('organizationName', editFormData.organizationName.trim());
         updateData.append('registrationNumber', editFormData.registrationNumber.trim());
         updateData.append('businessAddress', editFormData.businessAddress.trim());
         updateData.append('organizationDescription', editFormData.organizationDescription.trim());
         
         const response: ApiResponse<UserState> = await hostServices.updateHostDetailsByHost(updateData);
         
         setProfile((prev) => (prev ? { ...prev, ...response.data } : null));
         
         setIsEditing(false);
         toast.success('Host details updated successfully!');

      } catch (err) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setIsUpdatingHostDetails(false);
      }
   };

   const cancelEditing = () => {
      setIsEditing(false);
      setEditFormData({
         organizationName: profile.organizationName || '',
         registrationNumber: profile.registrationNumber || '',
         businessAddress: profile.businessAddress || '',
         organizationDescription: profile.organizationDescription || '',
      });
   };

   const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({ ...prev, [name]: value }));
   };



   
   return (
      <div className="bg-linear-to-tl from-(--brand-primary)/20 to-(--bg-secondary) rounded-2xl border-2 border-(--border-focus) p-7 shadow-sm">
         
         {/* Top Section: Avatar Logo */}
         <div className="flex justify-center mb-8">
            <div className="relative group">
               {/* Avatar - rounded-full (circular) */}
               {profile.organizationLogo ? (
                  <img
                     src={profile.organizationLogo}
                     alt={profile.organizationName || "Organization"}
                     referrerPolicy="no-referrer"
                     className="w-24 h-24 md:w-32 md:h-32 rounded-full
                        object-cover border-4 border-(--bg-primary)
                        shadow-lg transition-transform group-hover:scale-[1.02]"
                  />
               ) : (
                  <div
                     className="w-24 h-24 md:w-32 md:h-32 rounded-full
                        bg-(--bg-neutral)
                        flex items-center justify-center
                        text-(--brand-primary) text-4xl md:text-5xl font-bold
                        border-4 border-(--bg-primary)
                        shadow-lg"
                     >
                     {profile.organizationName?.charAt(0)?.toUpperCase() || "H"}
                  </div>
               )}

               {/* Avatar Loading Overlay */}
               {isUpdatingLogo && (
                  <div
                     className="absolute inset-0 z-10 rounded-full
                        bg-(--bg-overlay2)
                        flex items-center justify-center"
                     >
                     <LoadingSpinner1 size="md" />
                  </div>
               )}

               {/* Hover Overlay */}
               <div
                  className="absolute inset-0 rounded-full
                     bg-(--bg-overlay)/80
                     opacity-0 group-hover:opacity-100
                     transition-opacity
                     flex items-center justify-center"
               >
                  {/* Camera Upload Button */}
                  <label className="absolute -bottom-1 -right-1 cursor-pointer">
                     <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUpdatingLogo}
                     />

                     <div
                        className="w-10 h-10 rounded-full flex items-center justify-center
                           bg-(--brand-primary)
                           text-(--text-inverse)
                           hover:bg-(--brand-primary)/90
                           shadow-md border-2 border-(--bg-primary)
                           transition"
                     >
                        {isUpdatingLogo ? (
                           <Loader2
                           className="h-4 w-4 animate-spin text-(--text-inverse)"
                           />
                        ) : (
                           <Tooltip content="Choose Logo File" side="top">
                              <Camera size={18} />
                           </Tooltip>
                        )}
                     </div>
                  </label>
               </div>
            </div>
         </div>

         {/* Section Header for Details */}
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-(--heading-primary)">
               Organization Details
            </h2>
            
            {!isEditing && (
               <Tooltip content="Edit Host Details" side="top">
                  <Button
                     variant="ghost"
                     onClick={() => setIsEditing(true)}
                  >
                     <Edit size={18} />
                  </Button>
               </Tooltip>
            )}
         </div>

         {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Left Column */}
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-sm font-medium text-(--text-secondary)">Organization Name</label>
                     <Input
                        type="text"
                        name="organizationName"
                        value={editFormData.organizationName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="text-sm font-medium text-(--text-secondary)">Registration Number</label>
                     <Input
                        type="text"
                        name="registrationNumber"
                        value={editFormData.registrationNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                     />
                  </div>
               </div>

               {/* Right Column */}
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-sm font-medium text-(--text-secondary)">Organization Description</label>
                     <textarea
                        name="organizationDescription"
                        value={editFormData.organizationDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) resize-none"
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="text-sm font-medium text-(--text-secondary)">Business Address</label>
                     <textarea
                        name="businessAddress"
                        value={editFormData.businessAddress}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) resize-none"
                     />
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="col-span-1 md:col-span-2 flex gap-3 pt-3">
                  <Button
                     onClick={handleUpdateHostDetails}
                     disabled={isUpdatingHostDetails}
                  >
                     {isUpdatingHostDetails ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                     variant="outline"
                     onClick={cancelEditing}
                  >
                     Cancel
                  </Button>
               </div>
            </div>
         ) : (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left View Column */}
                  <div className="space-y-6">
                     <DetailItem label="Organization Name" value={profile.organizationName || '—'} />
                     <DetailItem label="Registration Number" value={profile.registrationNumber || '—'} />
                  </div>
                  
                  {/* Right View Column */}
                  <div className="space-y-6">
                     <DetailItem label="Description" value={profile.organizationDescription || '—'} isMultiline />
                     <DetailItem label="Business Address" value={profile.businessAddress || '—'} isMultiline/>
                  </div>
               </div>

               {/* RATINGS BLOCK */}
               {profile.hostStatus === 'approved' && (
                 <div className="pt-2">
                    <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                       Your Host Rating
                    </label>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2.5 px-5 py-2.5 bg-(--bg-primary) rounded-full border border-(--border-default) shadow-md w-fit">
                          {profile.ratingAverage && profile.ratingAverage > 0 ? (
                             <>
                                <span className="font-bold text-(--text-primary) text-lg leading-none">
                                   {profile.ratingAverage.toFixed(1)}
                                </span>
                                <StarRating rating={profile.ratingAverage} size={18} />
                             </>
                          ) : (
                             <span className="text-sm font-medium text-(--text-secondary)">No rating yet</span>
                          )}
                       </div>
                       {(profile.totalReviews ?? 0) > 0 && (
                          <span className="text-sm font-medium text-(--text-tertiary)">
                             based on {profile.totalReviews} ovations
                          </span>
                       )}
                    </div>
                 </div>
               )}

               {/* HOST STATUS & METADATA */}
               <div className="pt-5 mt-4 border-t border-(--border-muted)">
                  <div className="flex flex-wrap gap-x-10 gap-y-5">
                     <DetailItem
                        label="Host Status"
                        value={capitalize(profile.hostStatus || '—')}
                        accent={
                        profile.hostStatus === 'approved'
                           ? 'text-(--status-success) font-semibold'
                           : profile.hostStatus === 'rejected' || profile.hostStatus === 'blocked'
                           ? 'text-(--status-error) font-semibold'
                           : 'text-(--badge-warning-text) font-semibold'
                        }
                     />
                     {profile.hostAppliedAt && (
                        <DetailItem
                           label="Applied On"
                           value={formatDate1(profile.hostAppliedAt)}
                        />
                     )}
                     {profile.reviewedAt && (
                        <DetailItem
                           label="Reviewed On"
                           value={formatDate1(profile.reviewedAt)}
                        />
                     )}
                  </div>
               </div>

               {/* REJECTION REASON */}
               {profile.hostStatus === 'rejected' && profile.hostRejectionReason && (
                  <div className="mt-4">
                     <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                        Rejection Reason
                     </label>
                     <div className="p-4 bg-(--badge-error-bg) border border-(--badge-error-border) rounded-xl text-(--badge-error-text) text-sm shadow-sm">
                        {profile.hostRejectionReason}
                     </div>
                  </div>
               )}

               {/* CERTIFICATE LINK */}
               {profile.certificateUrl && (
                  <div className="mt-4">
                     <a
                        href={profile.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-(--brand-primary) hover:text-(--brand-primary-hover) font-medium transition-colors"
                     >
                        <span>View Registration Certificate</span>
                        <span aria-hidden>→</span>
                     </a>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default UserHostProfile;