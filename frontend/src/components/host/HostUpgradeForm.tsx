import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
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
   HostApplySchema,
   HostReapplySchema,
   MAX_FILE_SIZE, 
   type HostUpgradeFormData 
} from "@/schemas/host.schema";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FieldError } from "../shared/FieldError";
import { TextArea } from "../ui/text-area";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { hostServices } from "@/services/hostServices";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner1 } from "../shared/LoadingSpinner1";
import { ButtonLoader } from "../shared/ButtonLoader";
import { useNavigate } from "react-router-dom";
import type { ApiResponse } from "@/types/common.types";
import type { UserState } from "@/types/user.types";
import { TermsModal } from "@/components/shared/TermsModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


interface HostUpgradeFormProps {
  isReapply?: boolean;
}


const HostUpgradeForm = ({ isReapply = false }: HostUpgradeFormProps) => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitSuccess, setSubmitSuccess] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const [showTermsModal, setShowTermsModal] = useState(false);

   const [logoPreview, setLogoPreview] = useState<string>("");

   const { setUser, user } = useAuth();
   const navigate = useNavigate();


   const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
      setValue,
      reset,
      control,
   } = useForm<HostUpgradeFormData>({
      resolver: zodResolver(isReapply ? HostReapplySchema : HostApplySchema),
      defaultValues: {
         organizationName: "",
         registrationNumber: "",
         businessAddress: "",
         organizationDescription: "",
         hostDocument: undefined,
         organizationLogo: undefined,
         agreeTerms: false
      },
   });

   // Pre-fill form with previous data when re-applying
   useEffect(() => {
      if (isReapply && user) {
         reset({
            organizationName: user.organizationName || "",
            registrationNumber: user.registrationNumber || "",
            businessAddress: user.businessAddress || "",
            organizationDescription: user.organizationDescription || "",
            hostDocument: undefined, // Don't pre-fill file - force re-upload
            organizationLogo: undefined, // Don't pre-fill file - force re-upload
         });
      }
   }, [isReapply, user, reset]);

   // Watch host document to show selected file name
   const hostDocument = watch("hostDocument") as File | undefined;
   const organizationLogo = watch("organizationLogo") as File | undefined;


   useEffect(() => {
      if (organizationLogo) {
         const url = URL.createObjectURL(organizationLogo);
         setLogoPreview(url);

         return () => URL.revokeObjectURL(url);
      } else {
         setLogoPreview("");
      }
   }, [organizationLogo]);


   const onSubmit: SubmitHandler<HostUpgradeFormData> = async (data) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
         const formData = new FormData();
         formData.append("organizationName", data.organizationName);
         formData.append("registrationNumber", data.registrationNumber);
         formData.append("businessAddress", data.businessAddress);
         formData.append("organizationDescription", data.organizationDescription);
         
         if (data.hostDocument instanceof File) {
            formData.append("hostDocument", data.hostDocument);
         }
         if (data.organizationLogo instanceof File) {
            formData.append("organizationLogo", data.organizationLogo);
         }

         // console.log("Submitting host upgrade data:", data);

         const response: ApiResponse<UserState> = await hostServices.applyHostUpgrade(formData);
         console.log("Host upgrade response:", response);

         if (response.data) setUser(response.data);
         toast.success(response.message);

         setSubmitSuccess(true);
         reset();
         // navigate('/host', { replace: true });

      } catch (error: unknown) {
         console.error("Host upgrade submission error:", error);
         const errorMessage = getApiErrorMessage(error);
         setSubmitError(errorMessage);
         if (errorMessage) toast.error(errorMessage);
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
                              className="pl-12 min-h-20"
                           />
                        </div>
                        <FieldError message={errors.businessAddress?.message} />
                     </div>

                     {/* Organization Description */}
                     <div>
                        <label className="block text-sm font-medium mb-2 text-(--text-primary)">
                           Organization Description *
                        </label>
                        <div className="relative">
                           <FileText className="absolute left-4 top-4 w-5 h-5 text-(--text-tertiary) z-10" />
                           <TextArea
                              {...register("organizationDescription")}
                              placeholder="Tell attendees about your organization, what kind of events you host, and your mission..."
                              rows={4}
                              className="pl-12 min-h-24"
                           />
                        </div>
                        <FieldError message={errors.organizationDescription?.message} />
                     </div>

                     {/* Logo Upload */}
                     <div>
                        <label className="block text-sm font-medium mb-2 text-(--text-primary)">
                           Organization Logo {isReapply ? "(Optional)" : "*"}
                        </label>
                        <div className={`relative rounded-xl p-4 text-center cursor-pointer transition-all border-2 border-dashed 
                           ${errors.organizationLogo ? 'border-(--brand-primary-light) hover:border-(--brand-primary)' : 'border-(--border-muted) hover:border-(--brand-primary)/50 bg-(--bg-secondary)'}`}>
                           <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) setValue('organizationLogo', file, { shouldValidate: true });
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           
                           {/* DYNAMIC LOGO PREVIEW LOGIC */}
                           {organizationLogo ? (
                              <div className="flex flex-col items-center">
                                 <img src={logoPreview} alt="New Logo" className="w-16 h-16 rounded-full object-cover mb-2 border border-(--border-muted) bg-(--bg-primary)" />
                                 <p className="font-medium text-sm text-(--brand-primary)">{organizationLogo.name}</p>
                              </div>
                           ) : (isReapply && user?.organizationLogo) ? (
                              <div className="flex flex-col items-center">
                                 <img src={user.organizationLogo} alt="Current Logo" className="w-16 h-16 rounded-full object-cover mb-2 border border-(--border-muted) bg-(--bg-primary)" />
                                 <p className="text-xs text-(--text-secondary)">Existing Logo - Click to replace</p>
                              </div>
                           ) : (
                              <>
                                 <Upload className="w-6 h-6 mx-auto mb-2 text-(--text-tertiary)" />
                                 <p className="text-sm text-(--text-secondary)">Upload your logo (JPG, PNG, WEBP)</p>
                              </>
                           )}
                        </div>
                        <FieldError message={errors.organizationLogo?.message} />
                     </div>

                     {/* Certificate Upload */}
                     <div>
                        <label className="block text-sm font-medium mb-2 text-(--text-primary)">
                           Certificate / Document {isReapply ? "(Optional)" : "*"}
                        </label>
                        <div
                           className={`relative rounded-xl p-6 text-center cursor-pointer transition-all border-2 border-dashed ${
                              errors.hostDocument
                              ? 'border-(--brand-primary-light) hover:border-(--brand-primary)'
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
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           
                           {/* DYNAMIC DOCUMENT PREVIEW LOGIC */}
                           {hostDocument ? (
                              <div className="space-y-1">
                                 <FileText className="w-8 h-8 mx-auto mb-3 text-(--brand-primary)" />
                                 <p className="font-medium text-(--text-primary)">{hostDocument.name}</p>
                                 <p className="text-xs text-(--text-tertiary)">
                                    {(hostDocument.size / 1024 / 1024).toFixed(2)} MB
                                 </p>
                              </div>
                           ) : (isReapply && user?.certificateUrl) ? (
                              <div className="flex flex-col items-center space-y-2">
                                 <FileText className="w-8 h-8 text-(--text-tertiary)" />
                                 <p className="text-sm font-medium text-(--text-primary)">Existing Document Saved</p>
                                 {/* Use z-20 and position relative so the link is clickable ABOVE the invisible file input */}
                                 <a 
                                    href={user.certificateUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-xs text-(--text-brand) hover:underline z-20 relative"
                                    onClick={(e) => e.stopPropagation()}
                                 >
                                    View Current Document
                                 </a>
                                 <p className="text-xs text-(--text-tertiary)">Click anywhere to upload a new one to replace</p>
                              </div>
                           ) : (
                              <>
                                 <Upload className="w-8 h-8 mx-auto mb-3 text-(--text-tertiary)" />
                                 <p className="text-(--text-secondary)">Drop your file here or click to upload</p>
                                 <p className="text-sm mt-1 text-(--text-tertiary)">
                                    PDF, JPG, PNG up to {MAX_FILE_SIZE / (1024 * 1024)}MB
                                 </p>
                              </>
                           )}
                        </div>
                        <FieldError message={errors.hostDocument?.message} />
                     </div>

                     {/* 6. HOST TERMS & CONDITIONS */}
                     <div className="space-y-2">
                        <div className="flex items-start space-x-3 pt-2">
                           <Controller
                              name="agreeTerms"
                              control={control}
                              render={({ field }) => (
                                 <Checkbox
                                    id="hostAgreeTerms"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1 border-(--border-muted) data-[state=checked]:bg-(--brand-primary) data-[state=checked]:border-(--brand-primary)"
                                 />
                              )}
                           />
                           <Label htmlFor="hostAgreeTerms" className="text-sm text-(--text-secondary) leading-relaxed cursor-pointer font-normal">
                              I agree to the platform's
                              <span
                                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                                 className="text-(--brand-primary) hover:underline ml-1 font-medium"
                              >
                                 Host Guidelines & Terms of Service
                              </span>
                              , confirming that the details provided are accurate and I hold all necessary rights for this event.
                           </Label>
                        </div>
                        <FieldError message={errors.agreeTerms?.message} />
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

         {/* TermsModal */}
         <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            termTypes={["hostTerms", "cancellationTerms", "bookingTerms"]}
            title="Host Guidelines & Terms of Service"
         />
      </>
   );
};

export default HostUpgradeForm;