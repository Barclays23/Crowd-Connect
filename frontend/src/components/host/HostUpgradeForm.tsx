import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Building2,
  FileText,
  MapPin,
  Upload,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { 
   hostUpgradeSchema, 
   MAX_FILE_SIZE, 
   type HostUpgradeFormData 
} from "@/schemas/host-upgrade.schema";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FieldError } from "../ui/FieldError";
import { TextArea } from "../ui/text-area";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { hostServices } from "@/services/hostServices";


const HostUpgradeForm = () => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitSuccess, setSubmitSuccess] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
      setValue,
      reset,
   } = useForm<HostUpgradeFormData>({
      resolver: zodResolver(hostUpgradeSchema),
      defaultValues: {
         organizationName: "",
         registrationNumber: "",
         businessAddress: "",
         hostDocument: undefined,
      },
   });

   // Watch host document to show selected file name
   const hostDocument = watch("hostDocument");

   const onSubmit: SubmitHandler<HostUpgradeFormData> = async (data) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
         const formData = new FormData();
         formData.append("organizationName", data.organizationName);
         formData.append("registrationNumber", data.registrationNumber);
         formData.append("businessAddress", data.businessAddress);
         
         if (data.hostDocument instanceof File) {
            formData.append("hostDocument", data.hostDocument);
         }

         console.log("Submitting host upgrade data:", data);
         toast.info('submitted role upgrade application');

         const response = await hostServices.applyHostUpgrade(formData);
         console.log("Host upgrade response:", response);

         setSubmitSuccess(true);
         reset(); // Clear form

         // Optional: redirect after few seconds
         setTimeout(() => {
         // window.location.href = "/dashboard"; // or wherever you want
         }, 3000);

      } catch (error: any) {
         const errorMessage = getApiErrorMessage(error);
         console.error("Host upgrade submission error:", error);
         setSubmitError(errorMessage);
         toast.error(errorMessage);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
         <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
               <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--badge-primary-bg)]">
                  <Building2 className="w-10 h-10 text-[var(--brand-primary)]" />
               </div>
               <h1 className="text-3xl font-bold mb-3 text-[var(--heading-primary)]">
                  Become a Host
               </h1>
               <p className="max-w-md mx-auto text-[var(--text-secondary)]">
                  Apply to become a verified host and start creating amazing events for your audience.
               </p>
            </div>

            {/* Benefits */}
            <div className="rounded-xl p-6 mb-8 bg-[var(--badge-success-bg)] border border-[var(--badge-success-border)]">
               <h3 className="font-semibold mb-3 flex items-center gap-2 text-[var(--badge-success-text)]">
                  <CheckCircle2 className="w-5 h-5" />
                  Host Benefits
               </h3>
               <ul className="space-y-2 text-sm text-[var(--badge-success-text)]">
                  <li>• Create unlimited events and reach thousands of attendees</li>
                  <li>• Access detailed analytics and attendee insights</li>
                  <li>• Receive payments directly to your account</li>
                  <li>• Priority customer support</li>
               </ul>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-lg)]">
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Organization Name */}
                  <div>
                     <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                        Organization Name *
                     </label>
                     <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] z-10" />
                        <Input
                           {...register('organizationName')}
                           placeholder="Enter your organization name"
                           className="pl-12"
                        />
                     </div>
                     <FieldError message={errors.organizationName?.message} />
                  </div>

                  {/* Registration Number */}
                  <div>
                     <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                        Registration Number *
                     </label>
                     <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] z-10" />
                        <Input
                           {...register('registrationNumber')}
                           placeholder="Enter business registration number"
                           className="pl-12"
                        />
                     </div>
                     <FieldError message={errors.registrationNumber?.message} />
                  </div>

                  {/* Business Address */}
                  <div>
                     <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                        Business Address *
                     </label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-[var(--text-tertiary)] z-10" />
                        <TextArea
                           {...register("businessAddress")}
                           placeholder="Enter your full business address"
                           rows={3}
                           className="pl-12 min-h-[76px]"
                        />
                     </div>
                     <FieldError message={errors.businessAddress?.message} />
                  </div>

                  {/* Certificate Upload */}
                  <div>
                     <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                        {/* Business Certificate (Optional but recommended) */}
                        Certificate / Document *
                     </label>
                     <div
                        className={`relative rounded-xl p-6 text-center cursor-pointer transition-all border-2 border-dashed ${
                           errors.hostDocument
                           ? 'border-destructive bg-destructive/5'
                           : 'border-[var(--border-muted)] hover:border-[var(--brand-primary)]/50 bg-[var(--bg-secondary)]'
                        }`}
                     >
                        <input
                           type="file"
                           accept=".pdf,.jpg,.jpeg,.png"
                           onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) setValue('hostDocument', file, { shouldValidate: true });
                           }}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 mx-auto mb-3 text-[var(--text-tertiary)]" />

                        {hostDocument ? (
                           <div className="space-y-1">
                           <p className="font-medium text-[var(--text-primary)]">{hostDocument.name}</p>
                           <p className="text-xs text-[var(--text-tertiary)]">
                              {(hostDocument.size / 1024 / 1024).toFixed(2)} MB
                           </p>
                           </div>
                        ) : (
                           <>
                           <p className="text-[var(--text-secondary)]">Drop your file here or click to upload</p>
                           <p className="text-sm mt-1 text-[var(--text-tertiary)]">
                              PDF, JPG, PNG up to {MAX_FILE_SIZE / (1024 * 1024)}MB
                           </p>
                           </>
                        )}
                     </div>
                     <FieldError message={errors.hostDocument?.message} />
                  </div>

                  {/* Submit Button */}
                  <Button
                     type="submit"
                     disabled={isSubmitting}
                     size="lg"
                     className="w-full"
                  >
                  {isSubmitting ? (
                     <>
                        <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                        Submitting Application...
                     </>
                  ) : (
                     <>
                        Apply to Become a Host
                        <ArrowRight className="ml-2 h-5 w-5" />
                     </>
                  )}
                  </Button>

                  {/* Feedback messages */}
                  {submitSuccess && (
                     <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-center">
                        Application submitted successfully! 🎉
                        <br />
                        <span className="text-sm">We'll review it within 2-3 business days.</span>
                     </div>
                  )}

                  {submitError && (
                  <div
                     className={`
                        mt-6 p-4 rounded-xl text-center md:text-left
                        bg-[var(--badge-error-bg)] 
                        border border-[var(--badge-error-border)]
                        text-[var(--badge-error-text)]
                     `}
                  >
                     {submitError}
                  </div>
                  )}
               </form>
            </div>

            <p className="text-center mt-6 text-sm text-[var(--text-tertiary)]">
               Applications are typically reviewed within 2-3 business days
            </p>
         </div>
      </div>
   );
};

export default HostUpgradeForm;