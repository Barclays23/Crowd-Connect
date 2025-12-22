// frontend/src/components/admin/user-manage-form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-toastify"
import { userFormSchema } from "@/schemas/user.schema"
import { useEffect, useState, useRef } from "react"
import { Camera, X } from "lucide-react"
import { FieldError } from "../ui/FieldError"
import { getInitials } from "@/utils/namingConventions"
import { userServices } from "@/services/userServices"




interface User {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: "admin" | "host" | "user";
  status: "active" | "blocked" | "pending";
  profilePic?: string;
}


interface UserManageFormProps {
  user?: User | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}






export function UserManageForm({ user, onSuccess, onCancel }: UserManageFormProps) {
  const isEditMode = !!user;
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageError, setImageError] = useState<string>(""); // New state for image errors
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);


  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      role: user?.role ?? "user",
      status: user?.status || "pending",
      // profilePic: undefined,
    }
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
      //   profilePic: user.profilePic,
      });
      setPreviewImage(user.profilePic || "");
      setProfileFile(null);
      setImageError(""); // Clear any previous image error
    }
  }, [user, form]);




const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  setImageError("");

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setImageError("Please select a valid image file");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setImageError("Image size should be less than 2MB");
    return;
  }

  // ✅ Store file locally (NOT in RHF)
  setProfileFile(file);

  const reader = new FileReader();
  reader.onloadend = () => {
    setPreviewImage(reader.result as string);
  };
  reader.readAsDataURL(file);
};





   const removeImage = () => {
      setPreviewImage("");
      setImageError("");
      setProfileFile(null);

      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };




  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
      console.log("user form values:", values);
      console.log("file:", profileFile, "form values:", values);
      console.log('userId: ', user?.userId);

      const formData = new FormData();

      formData.append("name", values.name || "");
      formData.append("email", values.email || "");
      formData.append("role", values.role);
      formData.append("status", values.status);
      if (values.mobile) formData.append("mobile", values.mobile);
      if (profileFile) {
         formData.append("profileImage", profileFile);
      }

      console.log(`user formData to be sent:`, JSON.parse(JSON.stringify(Object.fromEntries(formData))));
    try {
      setLoading(true);
      if (isEditMode) {
         // Update existing user
         const response = await userServices.editUserService(user.userId, formData);

        toast.warn("User updated successfully!");
      } else {
         // Create new user
         await userServices.createUserService(formData);
        toast.warn("User created successfully!");
      }
      
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save user";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }





  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Main Grid: Profile on left, Form fields on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

         {/* Profile Picture Sidebar */}
         <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
         <div className="w-full max-w-sm">
            <FormItem>
               <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                     <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-[var(--border-muted)] ring-offset-[var(--card-bg)]">
                     <AvatarImage src={previewImage} alt="Profile" />
                     {/* {previewImage && <AvatarImage src={previewImage} alt="Profile" />} */}
                     <AvatarFallback className="bg-[var(--brand-primary-light)]/20 text-[var(--brand-primary)] text-3xl font-semibold">
                        {form.watch("name") ? getInitials(form.watch("name")) : "U"}
                     </AvatarFallback>
                     </Avatar>

                     {previewImage && (
                     <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-md"
                        onClick={removeImage}
                     >
                        <X className="h-4 w-4" />
                     </Button>
                     )}

                     <Button
                     type="button"
                     size="icon"
                     className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] shadow-lg"
                     onClick={() => fileInputRef.current?.click()}
                     >
                     <Camera className="h-5 w-5 text-white" />
                     </Button>

                     <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={handleImageChange}
                     />
                  </div>

                  <div className="w-full text-center lg:text-left space-y-2">
                     <FormLabel>Profile Picture</FormLabel>
                     <p className="text-xs text-[var(--text-tertiary)]">
                     (Optional • Max 2MB • JPG, PNG, WEBP, GIF, etc.)
                     </p>

                     {imageError && <FieldError message={imageError} />}
                  </div>
               </div>
            </FormItem>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" className="rounded-xl" {...field} />
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
                      <Input type="email" placeholder="Enter email" className="rounded-xl" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91-XXXXXXXXXX" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t border-[var(--border-muted)]">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
              Cancel
            </Button>
          )}
          <Button type="submit" className="rounded-xl px-6">
            {isEditMode ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  )
}