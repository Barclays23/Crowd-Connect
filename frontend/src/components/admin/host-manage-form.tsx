// frontend/src/components/admin/host-manage-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import { getInitials } from "@/utils/namingConventions";
import { userServices } from "@/services/userServices";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";
import { ButtonLoader } from "../common/ButtonLoader";


// Define a schema suitable for hosts
const hostFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  mobile: z.string().optional(),
  organizationName: z.string().min(2, "Organization name is required"),
  registrationNumber: z.string().min(3, "Registration number is required"),
  businessAddress: z.string().optional(),
  status: z.enum(["active", "blocked", "pending"]),
  // profileImage is handled separately (file)
});

type HostFormValues = z.infer<typeof hostFormSchema>;

interface HostManageFormProps {
   host?: any; // Adjust type according to your Host interface
   onSuccess?: (updatedHost?: any) => void;
   onCancel?: () => void;
}

export function HostManageForm({ host, onSuccess, onCancel }: HostManageFormProps) {
   const isEditMode = !!host;
   const [profileFile, setProfileFile] = useState<File | null>(null);
   const [previewImage, setPreviewImage] = useState<string>("");
   const [imageError, setImageError] = useState("");
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [loading, setLoading] = useState(false);

   const form = useForm<HostFormValues>({
      resolver: zodResolver(hostFormSchema),
      defaultValues: {
         name: "",
         email: "",
         mobile: "",
         organizationName: "",
         registrationNumber: "",
         businessAddress: "",
         status: "pending",
      },
   });

   useEffect(() => {
      if (host) {
         form.reset({
         name: host.name,
         email: host.email,
         mobile: host.mobile || "",
         organizationName: host.organizationName || "",
         registrationNumber: host.registrationNumber || "",
         businessAddress: host.businessAddress || "",
         status: host.status,
         });
         setPreviewImage(host.profilePic || "");
         setProfileFile(null);
      }
   }, [host, form]);

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
         setImageError("Please select a valid image file");
         return;
      }
      if (file.size > 2 * 1024 * 1024) {
         setImageError("Image size should be less than 2MB");
         return;
      }

      setImageError("");
      setProfileFile(file);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
   };

   const removeImage = () => {
      setPreviewImage("");
      setProfileFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
   };

   const onSubmit = async (values: HostFormValues) => {
      try {
         setLoading(true);
         const formData = new FormData();

         formData.append("name", values.name);
         formData.append("email", values.email);
         formData.append("role", "host"); // fixed
         formData.append("status", values.status);
         if (values.mobile) formData.append("mobile", values.mobile);
         formData.append("organizationName", values.organizationName);
         formData.append("registrationNumber", values.registrationNumber);
         if (values.businessAddress) formData.append("businessAddress", values.businessAddress);
         if (profileFile) formData.append("profileImage", profileFile);

         let response;
         if (isEditMode) {
         response = await userServices.editUserService(host.userId, formData);
         } else {
         response = await userServices.createUserService(formData);
         }

         toast.success(response.message);
         onSuccess?.(response?.userData || response);
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Failed to save host");
      } finally {
         setLoading(false);
      }
   };




   
   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-sm">
               <div className="absolute inset-0 z-50 !m-0 !p-0 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-[0.2px]"></div>
               <LoadingSpinner1
               size="lg"
               message={isEditMode ? "Updating host..." : "Creating host..."}
               />
            </div>
         )}

         <div className="mb-6">
               {isEditMode ? (
                  <h3 className="text-lg font-semibold">Edit Host Details</h3>
               ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                     <h3 className="text-lg font-semibold text-amber-800">Convert to Host</h3>
                     <p className="text-sm text-amber-700 mt-1">
                           You're converting <strong>{host?.name}</strong> ({host?.email}) to a Host account.
                           Please fill in the organization and business details.
                     </p>
                  </div>
               )}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <div className="lg:col-span-1 flex flex-col items-center">
               <div className="relative">
               <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-(--border-muted)">
                  <AvatarImage src={previewImage} />
                  <AvatarFallback className="bg-(--brand-primary-light)/20 text-3xl">
                     {form.watch("name") ? getInitials(form.watch("name")) : "H"}
                  </AvatarFallback>
               </Avatar>

               {previewImage && (
                  <Button
                     type="button"
                     size="icon"
                     variant="destructive"
                     className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                     onClick={removeImage}
                  >
                     <X className="h-4 w-4" />
                  </Button>
               )}

               <Button
                  type="button"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-(--brand-primary)"
                  onClick={() => fileInputRef.current?.click()}
               >
                  <Camera className="h-5 w-5" />
               </Button>

               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
               />
               </div>

               <div className="mt-4 text-center">
               <FormLabel>Profile Picture</FormLabel>
               <p className="text-xs text-(--text-tertiary) mt-1">
                  Optional • Max 2MB
               </p>
               {imageError && <p className="text-sm text-red-500 mt-1">{imageError}</p>}
               </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Full Name</FormLabel>
                     <FormControl>
                        <Input {...field} className="rounded-xl" />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                        <Input type="email" {...field} className="rounded-xl" />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Phone Number</FormLabel>
                     <FormControl>
                        <Input {...field} className="rounded-xl" />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Organization Name</FormLabel>
                     <FormControl>
                        <Input {...field} className="rounded-xl" />
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
                     <FormLabel>Registration Number</FormLabel>
                     <FormControl>
                        <Input {...field} className="rounded-xl" />
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
                     <FormLabel>Business Address</FormLabel>
                     <FormControl>
                        <Input {...field} className="rounded-xl" />
                     </FormControl>
                     <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                     <FormItem>
                     <FormLabel>Account Status</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                           <SelectTrigger className="rounded-xl">
                           <SelectValue placeholder="Select status" />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="active">Active</SelectItem>
                           <SelectItem value="pending">Pending</SelectItem>
                           <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                     </Select>
                     <FormMessage />
                     </FormItem>
                  )}
               />
               </div>
            </div>
         </div>

         {/* Buttons */}
         <div className="flex justify-end gap-3 pt-6 border-t border-(--border-muted)">
            {onCancel && (
               <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl" disabled={loading}>
               Cancel
               </Button>
            )}
            <Button
               type="submit"
               className="px-6 bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-white rounded-xl"
               disabled={loading}
            >
               <ButtonLoader loading={loading} loadingText={isEditMode ? "Updating..." : "Creating..."}>
               {isEditMode ? "Update Host" : "Convert to Host & Save"}
               </ButtonLoader>
            </Button>
         </div>
         </form>
      </Form>
   );
}