// frontend/src/components/admin/host-manage-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Upload, FileText, CheckCircle, AlertCircle, Phone, 
   Mail, Camera, Loader2, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { getInitials } from "@/utils/namingConventions";
import { LoadingSpinner1 } from "../shared/LoadingSpinner1";
import { ButtonLoader } from "../shared/ButtonLoader";
import { 
   ALLOWED_DOCUMENT_TYPES, 
   HostApplySchema, 
   HostReapplySchema, 
   MAX_FILE_SIZE, 
   type HostUpgradeFormData 
} from "@/schemas/host.schema";
import { hostServices } from "@/services/hostServices";
import { Badge } from "../ui/badge";
import type { UserState } from "@/types/user.types";
import { isPDF, getFileNameFromFileOrUrl, getFileExtension } from "@/utils/fileUtils";
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { ApiResponse } from "@/types/common.types";
import { Tooltip } from "@/components/shared/Tooltip";
import { StarRating } from "@/components/shared/StarRating";
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;



interface HostManageFormProps {
   host        : UserState;
   mode?       : "convertMode" | "editMode";
   onSuccess?  : (updatedHost?: UserState) => void;
   onCancel?   : () => void;
}



export function HostManageForm({ host, mode, onSuccess, onCancel }: HostManageFormProps) {
   const isEditMode = mode === "editMode";
   const isConvertMode = mode === "convertMode";

   const fileInputRef = useRef<HTMLInputElement>(null);
   const logoInputRef = useRef<HTMLInputElement>(null);

   // Document states
   const [hostDocument, setHostDocument] = useState<File | null>(null);
   const [documentPreview, setDocumentPreview] = useState<string>("");
   const [documentError, setDocumentError] = useState<string>("");
   
   // Convert Mode Logo states
   const [hostLogo, setHostLogo] = useState<File | null>(null);
   const [logoPreview, setLogoPreview] = useState<string>("");

   const [imageLoadError, setImageLoadError] = useState(false);
   const [loading, setLoading] = useState(false);
   const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
   const [numPages, setNumPages] = useState<number | null>(null);
   const [pdfError, setPdfError] = useState<string>('');



   const form = useForm<HostUpgradeFormData>({
         resolver: zodResolver(isConvertMode ? HostApplySchema : HostReapplySchema),
         defaultValues: {
            organizationName: host?.organizationName || "",
            registrationNumber: host?.registrationNumber || "",
            businessAddress: host?.businessAddress || "",
            organizationDescription: host?.organizationDescription || "",
         },
   });

   // Watch the organization name so the title updates live while typing in Convert Mode
   const watchOrgName = form.watch("organizationName");

   // Pre-fill form with existing data in editMode
   useEffect(() => {
      form.reset({
         organizationName: host.organizationName || "",
         registrationNumber: host.registrationNumber || "",
         businessAddress: host.businessAddress || "",
         organizationDescription: host.organizationDescription || "",
         agreeTerms: true  // no need to check the T&C checkbox when admin managing the host/user.
      });
   }, [host, form]);

   useEffect(() => {
      return () => {
         if (documentPreview && documentPreview.startsWith('blob:')) URL.revokeObjectURL(documentPreview);
         if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
      };
   }, [documentPreview, logoPreview]);

   useEffect(() => {
      setImageLoadError(false);
   }, [documentPreview, host?.certificateUrl]);



   const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (documentPreview && documentPreview.startsWith('blob:')) URL.revokeObjectURL(documentPreview);

      form.setValue("hostDocument", file, { shouldValidate: true });

      setHostDocument(file);

      form.setValue("hostDocument", file, { shouldValidate: true });

      if (file.type === "application/pdf") {
         setDocumentPreview("pdf");
      } else {
         setDocumentPreview(URL.createObjectURL(file));
      }
   };

   const handleInitialLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
      
      form.setValue('organizationLogo', file, { shouldValidate: true });
      setHostLogo(file);
      setLogoPreview(URL.createObjectURL(file));
   };

   const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isEditMode) return;
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('organizationLogo', file);

      try {
         setIsUpdatingLogo(true);
         const response: ApiResponse<UserState> = await hostServices.updateHostLogoByAdmin(host.userId, formData);
         toast.success("Organization logo updated successfully!");
         onSuccess?.(response.data);
      } catch (err: unknown) {
         const errorMessage = getApiErrorMessage(err);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setIsUpdatingLogo(false);
         e.target.value = ''; 
      }
   };

   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPdfError('');
   };
   const onDocumentLoadError = (error: Error) => {
      console.error('PDF load error:', error);
      setPdfError('Failed to load PDF preview');
   };

   const clearUploadedFile = () => {
      if (hostDocument) {
         if (documentPreview && documentPreview.startsWith('blob:')) URL.revokeObjectURL(documentPreview);
         setHostDocument(null);
         setDocumentPreview(isEditMode && host?.certificateUrl ? "" : "");
         if (fileInputRef.current) fileInputRef.current.value = "";

         form.setValue("hostDocument", undefined as any, { shouldValidate: true });
      }
   };

   const onSubmit = async (values: HostUpgradeFormData) => {
      const isFormValid = await form.trigger();
      if (!isFormValid) return;

      const isFileMandatory = isConvertMode || (isEditMode && !host?.certificateUrl);

      if (isFileMandatory && !hostDocument && !host?.certificateUrl) {
         form.setError("hostDocument", { 
            type: "manual", 
            message: "Business document/certificate is required" 
         });
         return;
      }

      // if (isConvertMode && !hostLogo) {
      //    form.setError("organizationLogo", { message: "Organization Logo is required" });
      //    return;
      // }

      try {
         setLoading(true);
         const formData = new FormData();
         formData.append("organizationName", values.organizationName);
         formData.append("registrationNumber", values.registrationNumber);
         formData.append("businessAddress", values.businessAddress);
         formData.append("organizationDescription", values.organizationDescription);
         
         if (hostDocument) formData.append("hostDocument", hostDocument);
         if (isConvertMode && hostLogo) formData.append("organizationLogo", hostLogo);

         let response: ApiResponse<UserState>;
         if (isEditMode) {
            response = await hostServices.updateHostDetailsByAdmin(host.userId, formData);
         } else {
            response = await hostServices.convertToHost(host.userId, formData);
         }

         toast.success(response.message);
         onSuccess?.(response?.data);

      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {loading && (
               <div className="absolute inset-0 z-50 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-[0.2px]">
                  <LoadingSpinner1 size="lg" message={isEditMode ? "Updating host details..." : "Converting to host..."} />
               </div>
            )}

            <div className="mb-8">
               {!isEditMode ? (
                  <div className="bg-(--status-info-bg) border border-(--status-info) rounded-lg p-5">
                     <h3 className="text-lg font-semibold text-(--status-info)">Convert User to Host</h3>
                     <p className="text-sm text-(--text-secondary) mt-2">
                        You're converting <strong>{host!.name}</strong> ({host!.email}) into a host account.
                        Please provide their business/organization details below.
                     </p>
                  </div>
               ) : (
                  <h3 className="text-lg font-semibold text-(--text-primary)">Update Organizer Business Details</h3>
               )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left: Identity, Status, and Owner Details */}
               <div className="lg:col-span-1 space-y-5">
                  
                  {/* Organization Identity */}
                  <div className="flex flex-col items-center p-4 bg-(--bg-secondary)/30 border border-(--border-muted) rounded-xl shadow-sm">
                     <div className="relative group w-32 h-32 mb-2">
                        <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-(--border-muted)">
                           <AvatarImage 
                              src={isEditMode ? host?.organizationLogo : host?.profilePic} 
                              alt={(isEditMode ? host?.organizationName : host?.name) || "Organization Logo"} 
                              className="object-cover bg-(--bg-primary)" 
                           />
                           <AvatarFallback className="bg-(--brand-primary-light)/10 text-4xl font-bold text-(--brand-primary)">
                              {isEditMode 
                              ? (host?.organizationName ? getInitials(host.organizationName) : <Building2 size={40} className="text-(--text-tertiary)"/>)
                              : getInitials(host?.name || "H")
                              }
                           </AvatarFallback>
                        </Avatar>

                        {/* Instant Logo Upload Overlay (Only in Edit Mode) */}
                        {isEditMode && (
                           <>
                              {isUpdatingLogo && (
                                 <div className="absolute inset-0 z-10 rounded-full bg-(--bg-overlay2) flex items-center justify-center">
                                    <LoadingSpinner1 size="sm" />
                                 </div>
                              )}
                              <label className="absolute inset-0 rounded-full bg-(--bg-overlay)/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                 <Tooltip content="Change Logo" side="top">
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} disabled={isUpdatingLogo} />
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-(--brand-primary) text-(--text-inverse) hover:bg-(--brand-primary)/90 shadow-md border-2 border-(--bg-primary) transition">
                                       {isUpdatingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera size={18} />}
                                    </div>
                                 </Tooltip>
                              </label>
                           </>
                        )}
                     </div>
                     
                     <h4 className="text-xl font-bold text-(--text-primary) text-center mt-3 truncate w-full px-2">
                        {isEditMode 
                        ? (host?.organizationName || "Unnamed Organization")
                        : (watchOrgName || "New Organization")
                        }
                     </h4>

                     {isEditMode && host?.hostStatus === 'approved' && (
                        <div className="flex items-center justify-center gap-2 mt-1.5">
                           <div className="flex items-center gap-1.5 bg-(--bg-primary) border border-(--border-muted) px-2.5 py-1 rounded-full shadow-sm">
                              <span className="font-bold text-sm text-amber-500 leading-none">
                                 {host.ratingAverage ? host.ratingAverage.toFixed(1) : "0.0"}
                              </span>
                              <StarRating rating={host.ratingAverage || 0} size={14} />
                           </div>
                           <span className="text-xs text-(--text-tertiary) font-medium">
                              ({host.totalReviews || 0} reviews)
                           </span>
                        </div>
                     )}
                  </div>

                  {/* Account Status */}
                  <div className="bg-(--bg-secondary) border border-(--border-muted) rounded-xl p-4 space-y-3 text-sm shadow-sm">
                     <div className="flex justify-between items-center">
                        <span className="text-(--text-secondary) font-medium">Role</span>
                        <Badge variant="outline" className="capitalize">{host?.role}</Badge>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-(--text-secondary) font-medium">Account Status</span>
                        <Badge variant={host?.status === "active" ? "success" : host?.status === "blocked" ? "destructive" : "outline"}>
                           {host?.status ? host.status.charAt(0).toUpperCase() + host.status.slice(1) : "Pending"}
                        </Badge>
                     </div>
                  </div>

                  {/* Account Owner / Personal Details */}
                  <div className="bg-(--bg-primary) border border-(--border-focus) rounded-xl p-4 shadow-sm">
                     <p className="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider mb-3">Account Owner</p>
                     <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-(--border-muted)">
                           <AvatarImage src={host?.profilePic}  alt={host?.name || "Account Owner"} />
                           <AvatarFallback className="bg-(--brand-primary-light)/20 text-(--brand-primary) text-sm font-medium">
                              {getInitials(host?.name || "U")}
                           </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                           <p className="font-medium text-(--text-primary) text-sm truncate">{host?.name}</p>
                           <div className="flex items-center gap-1.5 text-xs text-(--text-secondary) mt-0.5 truncate">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{host?.email}</span>
                              {host?.isEmailVerified && (
                                 <CheckCircle size={12} className="text-(--status-success) shrink-0" aria-label="Verified" />
                              )}
                           </div>
                           {host?.mobile && (
                              <div className="flex items-center gap-1.5 text-xs text-(--text-secondary) mt-0.5">
                                 <Phone className="h-3 w-3 shrink-0" />
                                 <span className="truncate">{host.mobile}</span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

               </div>

               {/* Right: Host Details Form */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-5">
                     <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Organization Name <span className="text-(--status-error)">*</span></FormLabel>
                              <FormControl>
                                 <Input {...field} placeholder="e.g. ABC Events Pvt Ltd" className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Registration Number <span className="text-(--status-error)">*</span></FormLabel>
                           <FormControl>
                              <Input {...field} placeholder="e.g. U12345KL2020PTC123456" className="rounded-xl" />
                           </FormControl>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="businessAddress"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Business Address <span className="text-(--status-error)">*</span></FormLabel>
                           <FormControl>
                              <Input {...field} placeholder="Full address with street, city, state, PIN" className="rounded-xl" />
                           </FormControl>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="organizationDescription"
                        render={({ field }) => (
                           <FormItem>
                           <FormLabel>Organization Description <span className="text-(--status-error)">*</span></FormLabel>
                           <FormControl>
                              <textarea 
                                 {...field} 
                                 placeholder="Tell us about the events hosted by this organization..." 
                                 className="flex w-full rounded-xl border border-(--form-input-border) bg-(--form-input-bg) 
                                 px-3 py-2 text-sm ring-offset-(--bg-primary) placeholder:text-(--text-tertiary) 
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary) focus-visible:ring-offset-2 
                                 disabled:cursor-not-allowed disabled:opacity-50 min-h-25 resize-none" 
                              />
                           </FormControl>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     {/* Initial Logo Upload (Only visible in Convert Mode) */}
                     {isConvertMode && (
                        <FormField
                           control={form.control}
                           name="organizationLogo"
                           render={() => (
                              <FormItem className="space-y-3">
                                 <FormLabel>Organization Logo <span className="text-(--status-error)">*</span></FormLabel>
                                 <FormControl>
                                    <div className={`relative rounded-xl p-4 text-center cursor-pointer transition-all border-2 border-dashed ${form.formState.errors.organizationLogo ? 'border-destructive bg-destructive/5' : 'border-(--border-muted) hover:border-(--brand-primary)/50 bg-(--bg-secondary)'}`}>
                                       <input
                                          ref={logoInputRef}
                                          type="file"
                                          accept="image/jpeg,image/png,image/webp"
                                          onChange={handleInitialLogoChange}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                       />
                                       {logoPreview ? (
                                          <div className="flex flex-col items-center">
                                             <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-cover rounded-full mb-2 border border-(--border-muted) bg-(--bg-primary)" />
                                             <p className="font-medium text-sm text-(--brand-primary)">{hostLogo?.name}</p>
                                          </div>
                                       ) : (
                                          <>
                                             <Upload className="w-6 h-6 mx-auto mb-2 text-(--text-tertiary)" />
                                             <p className="text-sm text-(--text-secondary)">Upload organization logo (JPG, PNG, WEBP)</p>
                                          </>
                                       )}
                                    </div>
                                 </FormControl>
                                 <FormMessage /> 
                              </FormItem>
                           )}
                        />
                     )}

                     {/* Host Document Upload */}
                     <FormField
                        control={form.control}
                        name="hostDocument"
                        render={() => (
                           <FormItem className="space-y-3">
                              <FormLabel>
                                 Business Registration Document / Certificate
                                 <span className="text-(--status-error)">*</span>
                                 {isEditMode && host?.certificateUrl && (
                                    <span className="text-xs font-normal text-(--status-success) ml-2">
                                       (Optional - upload only if changing)
                                    </span>
                                 )}
                              </FormLabel>
                              <FormControl>
                                 <div
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${form.formState.errors.hostDocument ? 'border-(--brand-primary-light)' : 'border-(--border-muted) hover:border-(--brand-primary-light)'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                 >
                                    {(documentPreview || (isEditMode && host?.certificateUrl)) ? (
                                       <div className="space-y-4">
                                          {/* PDF Preview */}
                                          {(documentPreview === "pdf" ||
                                             hostDocument?.type === "application/pdf" ||
                                             (isEditMode && !hostDocument && isPDF(host?.certificateUrl))) ? (
                                             <div className="flex flex-col items-center space-y-4">
                                                <div className="relative w-full max-w-md border border-(--border-muted) rounded-lg overflow-hidden bg-(--card-bg) shadow-sm">
                                                   <div className="flex justify-between items-center bg-(--bg-secondary) px-3 py-2 border-b border-(--border-muted)">
                                                      <div className="flex items-center gap-2">
                                                         <FileText className="h-4 w-4 text-(--status-error)" />
                                                         <span className="text-xs font-medium text-(--text-primary)">PDF Preview</span>
                                                      </div>
                                                      <div className="bg-(--status-error)/10 text-(--status-error) text-xs px-2 py-1 rounded">PDF</div>
                                                   </div>

                                                   <div className="relative h-64 overflow-auto bg-(--bg-secondary) flex items-center justify-center">
                                                      {pdfError ? (
                                                      <div className="text-center p-4">
                                                         <FileText className="h-12 w-12 text-(--text-tertiary) mx-auto mb-2" />
                                                         <p className="text-sm text-(--text-secondary)">PDF preview not available</p>
                                                         <p className="text-xs text-(--text-tertiary)">{pdfError}</p>
                                                      </div>
                                                      ) : (
                                                      <>
                                                         {hostDocument && hostDocument.type === "application/pdf" && (
                                                            <Document
                                                            file={hostDocument}
                                                            onLoadSuccess={onDocumentLoadSuccess}
                                                            onLoadError={onDocumentLoadError}
                                                            loading={<LoadingSpinner1 />}
                                                            error={<p>Failed to load PDF</p>}
                                                            >
                                                            <Page pageNumber={1} width={250} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-sm" />
                                                            </Document>
                                                         )}

                                                         {!hostDocument && host?.certificateUrl && isPDF(host.certificateUrl) && (
                                                            <Document
                                                            file={host.certificateUrl}
                                                            onLoadSuccess={onDocumentLoadSuccess}
                                                            onLoadError={onDocumentLoadError}
                                                            loading={<LoadingSpinner1 />}
                                                            error={<p>Failed to load PDF</p>}
                                                            >
                                                            <Page pageNumber={1} width={250} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-sm" />
                                                            </Document>
                                                         )}
                                                      </>
                                                      )}
                                                   </div>
                                                </div>
                                                <div className="text-center">
                                                   <p className="text-sm font-medium text-(--text-primary) truncate max-w-xs mx-auto">
                                                      {getFileNameFromFileOrUrl(hostDocument || host?.certificateUrl, "Business Document")}
                                                   </p>
                                                </div>
                                             </div>
                                          ) : (
                                             /* Image Preview */
                                             <div className="space-y-4">
                                                <div className="relative max-h-64 overflow-hidden rounded-lg bg-(--bg-primary)">
                                                   {imageLoadError ? (
                                                      <div className="flex flex-col items-center justify-center h-60 text-(--text-tertiary)">
                                                      <FileText className="h-12 w-12 mb-2" />
                                                      <p className="text-sm">Preview not available</p>
                                                      </div>
                                                   ) : (
                                                      <img
                                                      src={(documentPreview && documentPreview !== "pdf") ? documentPreview : host?.certificateUrl || ""}
                                                      alt="Document preview"
                                                      className="w-full h-auto object-contain max-h-60 mx-auto"
                                                      onError={() => setImageLoadError(true)}
                                                      />
                                                   )}
                                                </div>
                                                <div className="text-center">
                                                   <p className="text-sm font-medium text-(--text-primary) truncate max-w-xs mx-auto">
                                                      {getFileNameFromFileOrUrl(hostDocument || host?.certificateUrl, "Business Document")}
                                                   </p>
                                                </div>
                                             </div>
                                          )}

                                          <div className="flex justify-center gap-2">
                                             <Button type="button" variant="primaryOutline" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="gap-2">
                                                <Upload className="h-4 w-4" /> Change Document
                                             </Button>

                                             {isEditMode && hostDocument && (
                                             <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearUploadedFile(); }} className="gap-2 border border-(--border-muted)">
                                                <X className="h-4 w-4" /> Clear Selection
                                             </Button>
                                             )}
                                          </div>
                                       </div>
                                    ) : (
                                       /* --- Default Upload UI Fallback --- */
                                       <div className="space-y-4 py-4">
                                          <div className="mx-auto w-14 h-14 bg-(--brand-primary-light)/20 rounded-full flex items-center justify-center">
                                             <Upload className="h-7 w-7 text-(--brand-primary)" />
                                          </div>
                                          <div>
                                             <p className="text-sm font-medium text-(--text-primary)">Click to upload document</p>
                                             <p className="text-xs text-(--text-secondary) mt-1">Supports PDF, JPG, PNG (Max 5MB)</p>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </FormControl>

                              <input
                                 ref={fileInputRef}
                                 type="file"
                                 accept=".pdf,image/jpeg,image/jpg,image/png"
                                 className="hidden"
                                 onChange={handleDocumentChange}
                                 disabled={loading}
                              />
                              
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-(--border-muted)">
               {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl" disabled={loading}>
                  Cancel
                  </Button>
               )}
               <Button type="submit" className="px-8 bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text) rounded-xl font-medium" disabled={loading}>
                  <ButtonLoader loading={loading} loadingText={isEditMode ? "Updating..." : "Converting..."}>
                     {isEditMode ? "Update Host Details" : "Convert to Host"}
                  </ButtonLoader>
               </Button>
            </div>
         </form>
      </Form>
   );
}