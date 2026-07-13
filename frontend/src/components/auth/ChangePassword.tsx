// frontend/src/components/user/ChangePassword.tsx
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordData } from '@/schemas/user.schema';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import { userServices } from '@/services/userServices';
import { FieldError } from '@/components/ui/FieldError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { calculatePasswordStrength, passwordRules, passwordStrengthLevels } from '@/utils/password.utils';
import type { ApiResponse } from '@/types/common.types';

type FieldKey = keyof ChangePasswordData;


interface PasswordFieldConfig {
  key: FieldKey;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}

const FIELDS: PasswordFieldConfig[] = [
  {
    key: 'currentPassword',
    label: 'Current Password',
    placeholder: 'Enter your current password',
    icon: <Lock size={15} />,
  },
  {
    key: 'newPassword',
    label: 'New Password',
    placeholder: 'Enter your new password',
    icon: <KeyRound size={15} />,
  },
  {
    key: 'confirmPassword',
    label: 'Confirm New Password',
    placeholder: 'Confirm your new password',
    icon: <ShieldCheck size={15} />,
  },
];

interface Props {
  onCancel?: () => void;
}




const ChangePassword = ({ onCancel }: Props) => {
   const [formData, setFormData] = useState<ChangePasswordData>({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
   });

   const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
   const [showFields, setShowFields] = useState<Record<FieldKey, boolean>>({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
   });

   const [isSubmitting, setIsSubmitting] = useState(false);


   const toggleVisibility = (field: FieldKey) => {
      setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));
   };


   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
   };


   const handleSubmit = async () => {
      const validation = changePasswordSchema.safeParse(formData);

      if (!validation.success) {
         const fieldErrors: typeof errors = {};
         validation.error.issues.forEach((issue) => {
            const field = issue.path[0] as FieldKey;
            if (!fieldErrors[field]) fieldErrors[field] = issue.message;
         });
         setErrors(fieldErrors);
         return;
      }

      try {
         setIsSubmitting(true);

         const response: ApiResponse<void> = await userServices.changePassword({
            currentPassword: validation.data.currentPassword,
            newPassword: validation.data.newPassword,
         });

         toast.success(response.message);

         setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
         setErrors({});
         setShowFields({ currentPassword: false, newPassword: false, confirmPassword: false });
         onCancel?.();
         
      } catch (err) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setIsSubmitting(false);
      }
   };


   const handleReset = () => {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setShowFields({ currentPassword: false, newPassword: false, confirmPassword: false });
   };


   const newPassword = formData.newPassword;

   const hasTyped = newPassword.length > 0;


   const passwordRuleResults = useMemo(
      () =>
         passwordRules.map((rule) => ({
         ...rule,
         passed: hasTyped && rule.test(newPassword),
         })),
      [newPassword, hasTyped]
   );


   const strengthScore = useMemo(() => {
      if (!hasTyped) return -1;
      return calculatePasswordStrength(newPassword);
   }, [newPassword, hasTyped]);

   const strengthInfo = strengthScore >= 0 ? passwordStrengthLevels[strengthScore] : null;



   return (
      <div className="bg-(--bg-tertiary) rounded-2xl border border-(--card-border) p-6 md:p-7 shadow-sm">
         {/* Header */}
         <div className="flex items-center gap-3 mb-6">
         <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-(--brand-primary)/10 text-(--brand-primary)">
            <KeyRound size={18} />
         </div>
         <div>
            <h2 className="text-xl font-semibold text-(--heading-primary)">Change Password</h2>
            <p className="text-sm text-(--text-secondary) mt-0.5">
               Keep your account secure with a strong password
            </p>
         </div>
         </div>

         <div className="border-t border-(--card-border) mb-7" />

         {/* Two-column layout */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
         {/* LEFT: Form */}
         <div className="space-y-6">
            {FIELDS.map(({ key, label, placeholder, icon }) => (
               <div key={key} className="space-y-1.5">
               <label className="flex items-center gap-1.5 text-sm font-medium text-(--text-secondary)">
                  <span className="text-(--brand-primary)">{icon}</span>
                  {label}
               </label>

               <div className="relative">
                  <Input
                     type={showFields[key] ? 'text' : 'password'}
                     name={key}
                     value={formData[key]}
                     onChange={handleChange}
                     placeholder={placeholder}
                     disabled={isSubmitting}
                     className={cn(
                     'w-full pr-10',
                     errors[key] && 'border-red-500 focus-visible:ring-red-500'
                     )}
                  />
                  <button
                     type="button"
                     onClick={() => toggleVisibility(key)}
                     disabled={isSubmitting}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                     aria-label={showFields[key] ? 'Hide password' : 'Show password'}
                  >
                     {showFields[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
               </div>

               <FieldError message={errors[key]} />
               </div>
            ))}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
               <Button onClick={handleSubmit} disabled={isSubmitting}>
               {isSubmitting ? 'Updating...' : 'Update Password'}
               </Button>

               <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
               Clear
               </Button>

               {onCancel && (
               <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
               </Button>
               )}
            </div>
         </div>

         {/* RIGHT: Strength meter + checklist */}
         <div className="space-y-8 lg:pt-4">
            {/* Strength meter – only show when user has typed something */}
            {hasTyped && strengthInfo ? (
               <div className="space-y-2.5">
               <div className="text-sm font-medium text-(--text-secondary)">Password Strength</div>
               <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                     className={cn(
                     'h-full transition-all duration-400 ease-out',
                     strengthInfo.color,
                     strengthInfo.width
                     )}
                  />
               </div>
               <p className={cn('text-sm font-medium', strengthInfo.textColor)}>
                  {strengthInfo.label}
               </p>
               </div>
            ) : (
               <div className="min-h-[6.5rem]" /> // ← keeps layout stable (optional)
            )}

            {/* Checklist – always visible */}
            <div className="space-y-3">
               <div className="text-sm font-medium text-(--text-secondary)">Password must contain:</div>
               <ul className="space-y-2.5 text-sm">
               {passwordRuleResults.map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                     {rule.passed ? (
                     <span className="text-green-500 flex-shrink-0">
                        <svg
                           className="w-5 h-5"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="3"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        >
                           <polyline points="20 6 9 17 4 12" />
                        </svg>
                     </span>
                     ) : (
                     <span className="text-gray-400 flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <circle cx="12" cy="12" r="10" />
                        </svg>
                     </span>
                     )}
                     <span
                     className={cn(
                        rule.passed ? 'text-(--text-primary)' : 'text-(--text-tertiary)'
                     )}
                     >
                     {rule.label}
                     </span>
                  </li>
               ))}
               </ul>
            </div>
         </div>
         </div>
      </div>
   );
};

export default ChangePassword;




