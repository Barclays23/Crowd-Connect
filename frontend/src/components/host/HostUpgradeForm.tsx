import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Building2,
  FileText,
  MapPin,
  Upload,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { 
   HostUpgradeSchema, 
   MAX_FILE_SIZE, 
   type HostUpgradeFormData 
} from "@/schemas/host.schema";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FieldError } from "../ui/FieldError";
import { TextArea } from "../ui/text-area";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { hostServices } from "@/services/hostServices";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";
import { ButtonLoader } from "../common/ButtonLoader";
import { useNavigate } from "react-router-dom";


interface HostUpgradeFormProps {
  isReapply?: boolean;
}


const HostUpgradeForm = ({ isReapply = false }: HostUpgradeFormProps) => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitSuccess, setSubmitSuccess] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);

   const { setUser, user } = useAuth();
   const navigate = useNavigate();


   const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
      setValue,
      reset,
   } = useForm<HostUpgradeFormData>({
      resolver: zodResolver(HostUpgradeSchema),
      defaultValues: {
         organizationName: "",
         registrationNumber: "",
         businessAddress: "",
         hostDocument: undefined,
      },
   });

   // Pre-fill form with previous data when re-applying
   useEffect(() => {
      if (isReapply && user) {
         reset({
            organizationName: user.organizationName || "",
            registrationNumber: user.registrationNumber || "",
            businessAddress: user.businessAddress || "",
            hostDocument: undefined, // Don't pre-fill file - force re-upload
         });
      }
   }, [isReapply, user, reset]);

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

         // console.log("Submitting host upgrade data:", data);

         const response = await hostServices.applyHostUpgrade(formData);
         console.log("Host upgrade response:", response);

         toast.success(response.message);
         if (response.hostProfile) setUser(response.hostProfile);

         setSubmitSuccess(true);
         reset();
         // navigate('/host', { replace: true });

      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         console.error("Host upgrade submission error:", error);
         setSubmitError(errorMessage);
         toast.error(errorMessage);
      } finally {
         setIsSubmitting(false);
      }
   };



   

   return (
      <>
         {isSubmitting && (
            <div className="fixed inset-0 z-50 !m-0 !p-0 flex items-center justify-center bg-(--bg-overlay2) backdrop-blur-[0.1px]">
               <LoadingSpinner1 
                  message={isReapply ? "Submitting Re-application..." : "Processing Your Application"}
                  subMessage="This may take a few moments"
                  size="lg"
               />
            </div>
         )}

      
         <div className="min-h-screen bg-(--bg-primary) px-4 py-12">
            <div className="max-w-2xl mx-auto">
               {/* Header */}
               <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-(--badge-primary-bg)">
                  {isReapply ? (
                     <RefreshCw className="w-10 h-10 text-(--brand-primary)" />
                  ) : (
                     <Building2 className="w-10 h-10 text-(--brand-primary)" />
                  )}
                  </div>
                  <h1 className="text-3xl font-bold mb-3 text-(--heading-primary)">
                  {isReapply ? "Re-Apply to Become a Host" : "Become a Host"}
                  </h1>
                  <p className="max-w-md mx-auto text-(--text-secondary)">
                  {isReapply
                     ? "Update your information and re-submit your host application."
                     : "Apply to become a verified host and start creating amazing events for your audience."}
                  </p>
               </div>

               {/* Benefits */}
               <div className="rounded-xl p-6 mb-8 bg-(--badge-success-bg) border border-(--badge-success-border)">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-(--badge-success-text)">
                     <CheckCircle2 className="w-5 h-5" />
                     Host Benefits
                  </h3>
                  <ul className="space-y-2 text-sm text-(--badge-success-text)">
                     <li>• Create unlimited events and reach thousands of attendees</li>
                     <li>• Access detailed analytics and attendee insights</li>
                     <li>• Receive payments directly to your account</li>
                     <li>• Priority customer support</li>
                  </ul>
               </div>

               {/* Form Card */}
               <div className="rounded-2xl p-8 bg-(--card-bg) border border-(--card-border) shadow-(--shadow-lg)">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                     {/* Organization Name */}
                     <div>
                        <label className="block text-sm font-medium mb-2 text-(--text-primary)">
                           Organization Name *
                        </label>
                        <div className="relative">
                           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-tertiary) z-10" />
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
                        <label className="block text-sm font-medium mb-2 text-(--text-primary)">
                           Registration Number *
                        </label>
                        <div className="relative">
                           <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-tertiary) z-10" />
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
                        <label className="block text-sm font-medium mb-2 text-(--text-primary)">
                           Business Address *
                        </label>
                        <div className="relative">
                           <MapPin className="absolute left-4 top-4 w-5 h-5 text-(--text-tertiary) z-10" />
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
                        <label className="block text-sm font-medium mb-2 text-(--text-primary)">
                           {/* Business Certificate (Optional but recommended) */}
                           Certificate / Document *
                        </label>
                        <div
                           className={`relative rounded-xl p-6 text-center cursor-pointer transition-all border-2 border-dashed ${
                              errors.hostDocument
                              ? 'border-destructive bg-destructive/5'
                              : 'border-(--border-muted) hover:border-(--brand-primary)/50 bg-(--bg-secondary)'
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
                           <Upload className="w-8 h-8 mx-auto mb-3 text-(--text-tertiary)" />

                           {hostDocument ? (
                              <div className="space-y-1">
                              <p className="font-medium text-(--text-primary)">{hostDocument.name}</p>
                              <p className="text-xs text-(--text-tertiary)">
                                 {(hostDocument.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              </div>
                           ) : (
                              <>
                              <p className="text-(--text-secondary)">Drop your file here or click to upload</p>
                              <p className="text-sm mt-1 text-(--text-tertiary)">
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
                        <ButtonLoader 
                           loading={isSubmitting}
                           loadingText={isReapply ? "Submitting Re-application..." : "Submitting Application..."}
                        >
                           {isReapply ? "Re-Submit Application" : "Apply to Become a Host"}
                           <ArrowRight className="ml-2 h-5 w-5" />
                        </ButtonLoader>
                     </Button>

                     {/* Feedback messages */}
                     {submitSuccess && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-center">
                           {isReapply 
                           ? "Re-application submitted successfully! We'll review it again." 
                           : "Application submitted successfully! 🎉"}
                           <br />
                           <span className="text-sm">We'll review it within 2-3 business days.</span>
                        </div>
                     )}

                     {submitError && (
                     <div
                        className={`
                           mt-6 p-4 rounded-xl text-center md:text-left
                           bg-(--badge-error-bg) 
                           border border-(--badge-error-border)
                           text-(--badge-error-text)
                        `}
                     >
                        {submitError}
                     </div>
                     )}
                  </form>
               </div>

               <p className="text-center mt-6 text-sm text-(--text-tertiary)">
                  Applications are typically reviewed within 2-3 business days
               </p>
            </div>
         </div>
      </>
   );
};

export default HostUpgradeForm;