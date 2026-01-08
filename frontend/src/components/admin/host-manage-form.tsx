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
import { X, Upload, FileText, CheckCircle, AlertCircle, Phone, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { getInitials } from "@/utils/namingConventions";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";
import { ButtonLoader } from "../common/ButtonLoader";
import { HostUpgradeSchema, MAX_FILE_SIZE, type HostUpgradeFormData } from "@/schemas/host.schema";
import { hostServices } from "@/services/hostServices";
import { Badge } from "../ui/badge";
import type { UserState } from "@/types/user.types";
import { isPDF, getFileNameFromFileOrUrl, getFileExtension } from "@/utils/fileUtils";
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';




interface HostManageFormProps {
   host?: UserState | null;
   onSuccess?: (updatedHost?: any) => void;
   onCancel?: () => void;
}


const allowedTypes = [
   'application/pdf',
   'image/jpeg',
   'image/jpg',
   'image/png'
];




export function HostManageForm({ host, onSuccess, onCancel }: HostManageFormProps) {
   const isEditMode = !!host;
   const fileInputRef = useRef<HTMLInputElement>(null);
   
   const [hostDocument, setHostDocument] = useState<File | null>(null);
   const [documentPreview, setDocumentPreview] = useState<string>("");
   const [documentError, setDocumentError] = useState<string>("");
   const [imageLoadError, setImageLoadError] = useState(false);
   const [loading, setLoading] = useState(false);
   const [numPages, setNumPages] = useState<number | null>(null);
   const [pdfError, setPdfError] = useState<string>('');
   


   const form = useForm<HostUpgradeFormData>({
      resolver: zodResolver(HostUpgradeSchema),
      defaultValues: {
         organizationName: host?.organizationName || "",
         registrationNumber: host?.registrationNumber || "",
         businessAddress: host?.businessAddress || "",
      },
   });

   useEffect(() => {
      if (host) {
         form.reset({
         organizationName: host.organizationName || "",
         registrationNumber: host.registrationNumber || "",
         businessAddress: host.businessAddress || "",
         });
      }
   }, [host, form]);


   useEffect(() => {
      return () => {
         // Clean up any blob URLs when component unmounts
         if (documentPreview && documentPreview.startsWith('blob:')) {
            URL.revokeObjectURL(documentPreview);
         }
      };
   }, [documentPreview]);

   useEffect(() => {
      setImageLoadError(false);
   }, [documentPreview, host?.certificateUrl]);



   const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (documentPreview && documentPreview.startsWith('blob:')) {
         URL.revokeObjectURL(documentPreview);
      }

      if (file.size > MAX_FILE_SIZE) {
         setDocumentError("File size exceeds 5MB limit");
         setHostDocument(null);
         setDocumentPreview("");
         return;
      }

      if (!allowedTypes.includes(file.type)) {
         setDocumentError("Invalid file type. Please upload PDF, JPG, or PNG.");
         setHostDocument(null);
         setDocumentPreview("");
         return;
      }

      setDocumentError("");
      setHostDocument(file);

      if (file.type === "application/pdf") {
         setDocumentPreview("pdf");
      } else {
         // const reader = new FileReader();
         // reader.onloadend = () => setDocumentPreview(reader.result as string);
         // reader.readAsDataURL(file);

         const objectUrl = URL.createObjectURL(file);
         setDocumentPreview(objectUrl);
      }
   };


   // for pdf file preview.
   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPdfError('');
   };

   const onDocumentLoadError = (error: Error) => {
      console.error('PDF load error:', error);
      setPdfError('Failed to load PDF preview');
   };



   const clearUploadedFile = () => {
      // Only clear newly uploaded files
      if (hostDocument) {
         // Clean up blob URL if it exists
         if (documentPreview && documentPreview.startsWith('blob:')) {
            URL.revokeObjectURL(documentPreview);
         }
         
         setHostDocument(null);
         setDocumentPreview(isEditMode && host?.certificateUrl ? "" : "");
         if (fileInputRef.current) fileInputRef.current.value = "";
      }
   };


   const onSubmit = async (values: HostUpgradeFormData) => {
      // do this validation with zod schema later
      const isFileMandatory = !isEditMode || (isEditMode && !host?.certificateUrl);

      const isFormValid = await form.trigger();
      if (!isFormValid) {
         return; // React Hook Form will show field errors
      }
   
      if (isFileMandatory && !hostDocument && !host?.certificateUrl) {
         // Show error in UI instead of toast
         setDocumentError("Business document/certificate is required");
         return;
      }

      try {
         setLoading(true);
         const formData = new FormData();

         formData.append("organizationName", values.organizationName);
         formData.append("registrationNumber", values.registrationNumber);
         formData.append("businessAddress", values.businessAddress);
         if (hostDocument) formData.append("hostDocument", hostDocument)

         let response;

         if (isEditMode) {
            response = await hostServices.updateHostDetailsByAdmin(host.userId, formData);
         } else {
            response = await hostServices.convertToHost(host.userId, formData);
         }

         toast.success(response.message || `Host ${isEditMode ? "updated" : "converted"} successfully`);
         onSuccess?.(response?.userData || response);

      } catch (error: any) {
         toast.error(error.response?.data?.message || `Failed to ${isEditMode ? "update" : "convert"} host`);
      } finally {
         setLoading(false);
      }
   };




   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {loading && (
               <div className="absolute inset-0 z-50 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-[0.2px]">
                  <LoadingSpinner1
                  size="lg"
                  message={isEditMode ? "Updating host details..." : "Converting to host..."}
                  />
               </div>
            )}

            {/* Header Message */}
            <div className="mb-8">
               {!isEditMode ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                     <h3 className="text-lg font-semibold text-amber-800">Convert User to Host</h3>
                     <p className="text-sm text-amber-700 mt-2">
                        You're converting <strong>{host!.name}</strong> ({host!.email}) into a host account.
                        Please provide their business/organization details below.
                     </p>
                  </div>
               ) : (
                  <h3 className="text-lg font-semibold">Update Host Business Details</h3>
               )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left: User Info + Profile (Read-only) */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="text-left p-4">
                     <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-(--border-muted)">
                        <AvatarImage src={host?.profilePic} alt={host?.name} />
                        <AvatarFallback className="bg-(--brand-primary-light)/20 text-3xl text-(--brand-primary)">
                        {getInitials(host?.name || "H")}
                        </AvatarFallback>
                     </Avatar>

                     <h4 className="mt-4 text-lg font-semibold text-(--text-primary)">
                        {host?.name}
                     </h4>

                     <div className="flex items-center justify-start gap-1 text-sm text-(--text-secondary)">
                        <Mail className="h-4 w-4" />
                        {host?.email}
                        {host?.isEmailVerified ? (
                        <CheckCircle size={14} className="text-(--status-success)" />
                        ) : (
                        <AlertCircle size={14} className="text-(--status-error)" />
                        )}
                     </div>

                     <div className="flex items-center justify-start gap-1 text-sm text-(--text-tertiary)">
                        <Phone className="h-4 w-4" />
                        {host?.mobile ? (
                        host.mobile
                        ) : (
                        <span className="text-gray-500">Not provided</span>
                        )}
                     </div>

                     <div className="mt-3 flex items-center justify-start gap-2">
                        <Badge variant={host?.isEmailVerified ? "success" : "outline"}>
                           {host?.isEmailVerified ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                           {host?.isEmailVerified ? "Verified Account" : "Unverified Account"}
                        </Badge>
                     </div>
                  </div>

                  <div className="bg-(--bg-secondary) border border-(--border-muted) rounded-xl p-4 space-y-3 text-sm">
                     <div className="flex justify-between items-center">
                        <span className="text-(--text-secondary)">Role</span>
                        <Badge variant="outline" className="capitalize">
                        {host?.role}
                        </Badge>
                     </div>

                     <div className="flex justify-between items-center">
                        <span className="text-(--text-secondary)">Account Status</span>
                        <Badge
                        variant={
                           host?.status === "active"
                              ? "success"
                              : host?.status === "blocked"
                              ? "destructive"
                              : "outline"
                        }
                        >
                        {host?.status
                           ? host.status.charAt(0).toUpperCase() + host.status.slice(1)
                           : "Pending"}
                        </Badge>
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
                           <FormLabel>Organization Name <span className="text-red-500">*</span></FormLabel>
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
                           <FormLabel>Registration Number <span className="text-red-500">*</span></FormLabel>
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
                           <FormLabel>Business Address <span className="text-red-500">*</span></FormLabel>
                           <FormControl>
                              <Input {...field} placeholder="Full address with street, city, state, PIN" className="rounded-xl" />
                           </FormControl>
                           <FormMessage />
                           </FormItem>
                        )}
                     />

                     {/* Host Document Upload */}
                     <div className="space-y-3">
                        <FormLabel>
                           Business Registration Document / Certificate 
                           <span className="text-red-500">*</span>
                           {isEditMode && host?.certificateUrl && (
                              <span className="text-xs font-normal text-green-600 ml-2">(Optional - upload only if changing)</span>
                           )}
                        </FormLabel>

                        <div 
                           className="border-2 border-dashed border-(--border-muted) rounded-xl p-6 text-center cursor-pointer hover:border-(--brand-primary-light) transition-colors"
                           onClick={() => fileInputRef.current?.click()}
                        >
                           {/* Show preview if we have either: uploaded file OR existing URL (edit mode) */}
                           {(documentPreview || (isEditMode && host?.certificateUrl)) ? (
                              <div className="space-y-4">
                                 {/* PDF Preview */}
                                 {(documentPreview === "pdf" || 
                                 hostDocument?.type === "application/pdf" || 
                                 (isEditMode && !hostDocument && isPDF(host?.certificateUrl))) ? (
                                 <div className="flex flex-col items-center space-y-4">
                                    {/* PDF Preview Container */}
                                    <div className="relative w-full max-w-md border border-(--border-muted) rounded-lg overflow-hidden bg-white shadow-sm">
                                       <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border-b">
                                       <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-red-500" />
                                          <span className="text-xs font-medium">PDF Preview</span>
                                       </div>
                                       <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                          PDF
                                       </div>
                                       </div>
                                       
                                       <div className="relative h-64 overflow-auto bg-gray-50 flex items-center justify-center">
                                       {pdfError ? (
                                          <div className="text-center p-4">
                                             <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                             <p className="text-sm text-gray-500">PDF preview not available</p>
                                             <p className="text-xs text-gray-400">{pdfError}</p>
                                          </div>
                                       ) : (
                                          <>
                                             {/* For uploaded PDF files */}
                                             {hostDocument && hostDocument.type === "application/pdf" && (
                                             <Document
                                                file={hostDocument}
                                                onLoadSuccess={onDocumentLoadSuccess}
                                                onLoadError={onDocumentLoadError}
                                                loading={
                                                   <div className="text-center p-4">
                                                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                                                   <p className="text-xs text-gray-500 mt-2">Loading PDF...</p>
                                                   </div>
                                                }
                                                error={
                                                   <div className="text-center p-4">
                                                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                   <p className="text-sm text-gray-500">Failed to load PDF</p>
                                                   </div>
                                                }
                                             >
                                                <Page
                                                   pageNumber={1}
                                                   width={250}
                                                   renderTextLayer={false}
                                                   renderAnnotationLayer={false}
                                                   className="shadow-sm"
                                                />
                                             </Document>
                                             )}
                                             
                                             {/* For URL-based PDFs */}
                                             {!hostDocument && host?.certificateUrl && isPDF(host.certificateUrl) && (
                                             <Document
                                                file={host.certificateUrl}
                                                onLoadSuccess={onDocumentLoadSuccess}
                                                onLoadError={onDocumentLoadError}
                                                loading={
                                                   <div className="text-center p-4">
                                                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                                                   <p className="text-xs text-gray-500 mt-2">Loading PDF...</p>
                                                   </div>
                                                }
                                                error={
                                                   <div className="text-center p-4">
                                                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                   <p className="text-sm text-gray-500">Failed to load PDF</p>
                                                   </div>
                                                }
                                             >
                                                <Page
                                                   pageNumber={1}
                                                   width={250}
                                                   renderTextLayer={false}
                                                   renderAnnotationLayer={false}
                                                   className="shadow-sm"
                                                />
                                             </Document>
                                             )}
                                             
                                             {/* For newly uploaded files that haven't been processed yet */}
                                             {documentPreview === "pdf" && !hostDocument && (
                                             <div className="text-center p-4">
                                                <FileText className="h-16 w-16 text-red-500 mx-auto mb-2" />
                                                <p className="text-sm font-medium">PDF Document</p>
                                                <p className="text-xs text-gray-500 mt-1">Preview loading...</p>
                                             </div>
                                             )}
                                          </>
                                       )}
                                       </div>
                                       
                                       {numPages && numPages > 1 && (
                                       <div className="bg-gray-50 border-t px-3 py-1 text-center">
                                          <p className="text-xs text-gray-500">
                                             Page 1 of {numPages} • Scroll to see more
                                          </p>
                                       </div>
                                       )}
                                    </div>
                                    
                                    {/* File Info */}
                                    <div className="text-center">
                                       <p className="text-sm font-medium truncate max-w-xs">
                                       {getFileNameFromFileOrUrl(
                                          hostDocument || host?.certificateUrl, 
                                          "Business Document"
                                       )}
                                       </p>
                                       {hostDocument && (
                                       <p className="text-xs text-(--text-tertiary) mt-1">
                                          {(hostDocument.size / (1024 * 1024)).toFixed(2)} MB
                                          {numPages && ` • ${numPages} page${numPages > 1 ? 's' : ''}`}
                                       </p>
                                       )}
                                       {!hostDocument && numPages && (
                                       <p className="text-xs text-(--text-tertiary) mt-1">
                                          {numPages} page{numPages > 1 ? 's' : ''}
                                       </p>
                                       )}
                                    </div>
                                 </div>
                                 ) : (
                                 /* Image Preview */
                                 <div className="space-y-4">
                                    <div className="relative max-h-64 overflow-hidden rounded-lg bg-(--bg-secondary)">
                                       {imageLoadError ? (
                                       <div className="flex flex-col items-center justify-center h-60 text-(--text-tertiary)">
                                          <FileText className="h-12 w-12 mb-2" />
                                          <p className="text-sm">Preview not available</p>
                                       </div>
                                       ) : (
                                       <img
                                          src={(documentPreview && documentPreview !== "pdf") ? documentPreview : host?.certificateUrl || ""}
                                          alt="Document preview"
                                          className="w-full h-auto object-contain max-h-60"
                                          onError={() => setImageLoadError(true)}
                                       />
                                       )}
                                       {/* Show file format badge for uploaded files */}
                                       {hostDocument && !imageLoadError && (
                                       <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                          {getFileExtension(hostDocument)}
                                       </div>
                                       )}
                                       {/* Show file format badge for URL files (if we can detect format) */}
                                       {!hostDocument && host?.certificateUrl && !imageLoadError && (
                                       <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                          {getFileExtension(host?.certificateUrl)}
                                       </div>
                                       )}
                                    </div>
                                    <div className="text-center">
                                       <p className="text-sm font-medium">
                                       {getFileNameFromFileOrUrl(
                                          hostDocument || host?.certificateUrl,
                                          "Business Document"
                                       )}
                                       </p>
                                       {hostDocument && (
                                       <p className="text-xs text-(--text-tertiary)">
                                          {(hostDocument.size / (1024 * 1024)).toFixed(2)} MB
                                       </p>
                                       )}
                                    </div>
                                 </div>
                                 )}
                                 
                                 {/* Action Buttons */}
                                 <div className="flex justify-center gap-2">
                                    {/* Change/Upload Button */}
                                    <Button 
                                       type="button" 
                                       variant="outline" 
                                       size="sm" 
                                       onClick={(e) => { 
                                       e.stopPropagation(); 
                                       fileInputRef.current?.click();
                                       }}
                                       className="gap-2"
                                    >
                                       <Upload className="h-4 w-4" />
                                       {/* {hostDocument ? "Change Document" : "Upload New Document"} */}
                                       Change Document
                                    </Button>
                                    
                                    {/* Clear Button - Only show in edit mode when user has selected a new file */}
                                    {isEditMode && hostDocument && (
                                       <Button 
                                       type="button" 
                                       variant="ghost" 
                                       size="sm" 
                                       onClick={(e) => { 
                                          e.stopPropagation(); 
                                          clearUploadedFile();
                                       }}
                                       className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                       >
                                       <X className="h-4 w-4" />
                                       Clear Selection
                                       </Button>
                                    )}
                                 </div>
                              </div>
                           ) : (
                              /* Upload Prompt (when no file selected and no existing URL) */
                              <div className="space-y-4 py-4">
                              <div className="mx-auto w-14 h-14 bg-(--brand-primary-light)/20 rounded-full flex items-center justify-center">
                                 <Upload className="h-7 w-7 text-(--brand-primary)" />
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-(--text-primary)">
                                    Click to upload document
                                 </p>
                                 <p className="text-xs text-(--text-secondary) mt-1">
                                    Supports PDF, JPG, PNG (Max 5MB)
                                 </p>
                                 <div className="flex items-center justify-center gap-2 mt-2 text-xs text-(--text-tertiary)">
                                    <FileText className="h-3 w-3" />
                                    <span>Business Certificate, GST, Registration Proof</span>
                                 </div>
                              </div>
                              </div>
                           )}
                        </div>

                        <input
                           ref={fileInputRef}
                           type="file"
                           accept=".pdf,image/jpeg,image/jpg,image/png"
                           className="hidden"
                           onChange={handleDocumentChange}
                           disabled={loading}
                        />

                        {documentError && (
                           <div className="flex items-center gap-2 text-sm text-red-500">
                              <AlertCircle className="h-4 w-4" />
                              <span>{documentError}</span>
                           </div>
                        )}
                     
                        {/* Helper text */}
                        <div className="text-xs text-(--text-tertiary) space-y-1">
                           <p>• Clear, legible document showing business registration details</p>
                           <p>• Max file size: 5MB</p>
                           
                           {isEditMode ? (
                              host?.certificateUrl ? (
                              <>
                                 <p className="text-green-600">✓ Document already uploaded</p>
                                 <p className="text-amber-600">Note: Upload new document only if you want to replace the existing one</p>
                              </>
                              ) : (
                              <p className="text-red-600">⚠️ No document found. Upload is required.</p>
                              )
                           ) : (
                              <p className="text-red-600">⚠️ Document upload is required for host conversion</p>
                           )}
                        </div>
                     </div>
                     
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-(--border-muted)">
               {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl" disabled={loading}>
                  Cancel
                  </Button>
               )}
               <Button
                  type="submit"
                  className="px-8 bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-white rounded-xl font-medium"
                  disabled={loading}
               >
                  <ButtonLoader loading={loading} loadingText={isEditMode ? "Updating..." : "Converting..."}>
                  {isEditMode ? "Update Host Details" : "Convert to Host"}
                  </ButtonLoader>
               </Button>
            </div>
         </form>
      </Form>
   );
}