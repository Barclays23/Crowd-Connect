// frontend/src/components/user/UserHostProfile.tsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertTriangle, Camera, Edit, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { UserState } from '@/types/user.types';
import type { ApiResponse } from '@/types/common.types';
import { hostServices } from '@/services/hostServices';
import { Button } from '@/components/ui/button';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import { profilePicUploadSchema } from '@/schemas/user.schema';
import { Tooltip } from '@/components/common/Tooltip';
import { HostDetailsView } from '@/components/host/HostDetailsView';
import { HostDetailsEdit } from '@/components/host/HostDetailsEdit';
import { HOST_STATUS } from '@/constants/user-system.constants';



interface Props {
   profile: UserState;
   setProfile: React.Dispatch<React.SetStateAction<UserState | null>>;
}




const UserHostProfile = ({ profile, setProfile }: Props) => {
   const [isEditing, setIsEditing] = useState(false);
   const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);

   const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const confirmUpdate = window.confirm(
         "⚠️ WARNING: Changing your organization logo will change your host status to PENDING for admin review.\n\nYou will temporarily lose access to create, edit, publish, or cancel events until approved. Do you wish to proceed?"
      );

      if (!confirmUpdate) {
         e.target.value = '';
         return;
      }

      const validation = profilePicUploadSchema.safeParse({ profileImage: file });

      if (!validation.success) {
         toast.error(validation.error.issues[0].message);
         return;
      }

      const formData = new FormData();
      formData.append('organizationLogo', file);

      try {
         setIsUpdatingLogo(true);
         const response: ApiResponse<UserState> = await hostServices.updateHostLogoByHost(formData);
         setProfile((prev) => (prev ? { ...prev, organizationLogo: response.data.organizationLogo } : null));
         toast.success(response.message);

      } catch (err: unknown) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setIsUpdatingLogo(false);
         e.target.value = ''; 
      }
   };



   return (
      <div className="bg-linear-to-tl from-(--brand-primary)/20 to-(--bg-secondary) rounded-2xl border-2 border-(--border-focus) p-7 shadow-sm">

         {/* 3. PERMANENT WARNING BANNER */}
         <div className="mb-8 p-4 text-(--text-tertiary) bg-(--bg-primary) border-l-4 border-amber-500 rounded-r-lg flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0 text-amber-500" />
            <div className="text-sm">
               <p className="font-bold text-amber-500 mb-1">Important Account Notice</p>
               <p>
                  Updating your organization details, documents, or logo will temporarily suspend your hosting privileges. 
                  Your hosting permission will change to <strong>PENDING</strong> for admin review. 
                  During this time, you will be <strong>unable to manage, edit, or cancel your live events</strong>. 
                  Please ensure you have no urgent event updates before proceeding.
               </p>
            </div>
         </div>
         

         {/* Top Section: Avatar Logo & Organization Name */}
         <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
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
                  <div className="absolute inset-0 z-10 rounded-full bg-(--bg-overlay2) flex items-center justify-center">
                     <LoadingSpinner1 size="md" />
                  </div>
               )}

               {/* Hover Overlay */}
               <div className="absolute inset-0 rounded-full bg-(--bg-overlay)/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {/* Camera Upload Button */}
                  <label className="absolute -bottom-1 -right-1 cursor-pointer">
                     <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUpdatingLogo}
                     />
                     <div className="w-10 h-10 rounded-full flex items-center justify-center bg-(--brand-primary) text-(--text-inverse) hover:bg-(--brand-primary)/90 shadow-md border-2 border-(--bg-primary) transition">
                        {isUpdatingLogo ? (
                           <Loader2 className="h-4 w-4 animate-spin text-(--text-inverse)"/>
                        ) : (
                           <Tooltip content="Choose Logo File" side="top">
                              <Camera size={18} />
                           </Tooltip>
                        )}
                     </div>
                  </label>
               </div>
            </div>

            {/* BIG TEXT ORGANIZATION NAME */}
            <h3 className="text-2xl md:text-3xl font-bold text-(--heading-primary) text-center px-4">
               {profile.organizationName || "Unnamed Organization"}
            </h3>
         </div>

         {/* Section Header */}
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-(--heading-primary)">
               Organization Details
            </h2>
            
            {!isEditing && (
               <Tooltip content="Edit Host Details" side="top">
                  <Button variant="ghost" onClick={() => setIsEditing(true)}>
                     <Edit size={18} />
                  </Button>
               </Tooltip>
            )}
         </div>

         {/* Delegated Rendering based on state */}
         {isEditing ? (
             <HostDetailsEdit 
                profile={profile} 
                onSuccess={(updatedData) => {
                    setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
                    setIsEditing(false);
                }} 
                onCancel={() => setIsEditing(false)} 
             />
         ) : (
             <HostDetailsView profile={profile} />
         )}
         
      </div>
   );
};

export default UserHostProfile;