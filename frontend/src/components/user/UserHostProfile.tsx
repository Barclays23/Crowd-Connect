// frontend/src/components/user/UserHostProfile.tsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { UserState } from '@/types/user.types';
import DetailItem from '../ui/detail-item';
import { capitalize } from '@/utils/namingConventions';
import { formatDate1 } from '@/utils/dateAndTimeFormats';
import { hostServices } from '@/services/hostServices';



interface Props {
   profile: UserState;
   setProfile: React.Dispatch<React.SetStateAction<UserState | null>>;
}




const UserHostProfile = ({ profile, setProfile }: Props) => {
   const [editingField, setEditingField] = useState<string | null>(null);
   const [editFormData, setEditFormData] = useState({
      organizationName: profile.organizationName || '',
      registrationNumber: profile.registrationNumber || '',
      businessAddress: profile.businessAddress || '',
   });
   const [isUpdatingHostDetails, setIsUpdatingHostDetails] = useState(false);



   const handleUpdateHostDetails = async () => {
      try {
         setIsUpdatingHostDetails(true);
         const updateData = {
            organizationName: editFormData.organizationName.trim() || null,
            registrationNumber: editFormData.registrationNumber.trim() || null,
            businessAddress: editFormData.businessAddress.trim() || null,
         };
         // await hostServices.updateHostDetails(updateData);  // or 
         await hostServices.updateHostDetailsByHost(updateData);
         setProfile((prev) => (prev ? { ...prev, ...updateData } : null));
         setEditingField(null);
         toast.success('Host details updated successfully!');

      } catch (err) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setIsUpdatingHostDetails(false);
      }
   };

   const startEditing = () => setEditingField('host');

   const cancelEditing = () => {
      setEditingField(null);
      setEditFormData({
         organizationName: profile.organizationName || '',
         registrationNumber: profile.registrationNumber || '',
         businessAddress: profile.businessAddress || '',
      });
   };

   const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({ ...prev, [name]: value }));
   };




   
   return (
      <div className="max-w-4xl mx-auto px-5 md:px-0 space-y-8">
         <div className="bg-(--bg-tertiary) rounded-2xl border border-(--card-border) p-7 shadow-sm">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-(--heading-primary)">
               Organization / Host Details
            </h2>
            {editingField !== 'host' && (
               <button
               onClick={startEditing}
               className="px-4 py-2 bg-(--btn-primary-bg) text-(--btn-primary-text) rounded-lg hover:bg-(--btn-primary-hover) transition-colors font-medium"
               >
               Edit Host Details
               </button>
            )}
         </div>

         {editingField === 'host' ? (
            <div className="space-y-6">
               <div className="space-y-2">
               <label className="text-sm font-medium text-(--text-secondary)">Organization Name</label>
               <input
                  type="text"
                  name="organizationName"
                  value={editFormData.organizationName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
               />
               </div>

               <div className="space-y-2">
               <label className="text-sm font-medium text-(--text-secondary)">Registration Number</label>
               <input
                  type="text"
                  name="registrationNumber"
                  value={editFormData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) text-(--form-input-text) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
               />
               </div>

               <div className="space-y-2">
               <label className="text-sm font-medium text-(--text-secondary)">Business Address</label>
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
      </div>
   );
};

export default UserHostProfile;