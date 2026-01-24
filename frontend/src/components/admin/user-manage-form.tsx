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
import { Camera, CheckCircle, X } from "lucide-react"
import { FieldError } from "../ui/FieldError"
import { getInitials } from "@/utils/namingConventions"
import { userServices } from "@/services/userServices"
import { LoadingSpinner1 } from "../common/LoadingSpinner1"
import { ButtonLoader } from "../common/ButtonLoader"
import type { UserState, UserUpsertResult } from "@/types/user.types"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/utils/getApiErrorMessage"







interface UserManageFormProps {
  user?: UserState | null;
  onSuccess?: (user?: UserUpsertResult) => void;
  onCancel?: () => void;
  onSubmitting?: (loading: boolean) => void;
}





export function UserManageForm({ user, onSuccess, onCancel, onSubmitting }: UserManageFormProps) {
  const isEditMode = !!user;
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadingMessage = isEditMode ? "Updating user..." : "Creating user...";
  const isUploadingImage = Boolean(profileFile);
  const loadingSubMessage = isUploadingImage ? "Uploading image..." : "Saving changes...";


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
        mobile: user.mobile ?? "",
        role: user.role,
        status: user.status,
      //   profilePic: user.profilePic,
      });
      setPreviewImage(user.profilePic || "");
      setProfileFile(null);
      setImageError(""); // Clear previous image error
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
      formData.append("mobile", values.mobile ?? "");
      if (profileFile) {
         formData.append("profileImage", profileFile);
      }

      console.log(`user formData to be sent:`, JSON.parse(JSON.stringify(Object.fromEntries(formData))));
    try {
      setIsSubmitting(true);
      onSubmitting?.(true);

      let response;

      if (isEditMode && user) {
        response = await userServices.editUserService(user.userId, formData);
        toast.success(response.message);

      } else {
         response = await userServices.createUserService(formData);
        toast.success(response.message);
      }
      
      onSuccess?.(response?.userData);

    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      onSubmitting?.(false);
    }
  }





  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-8">

        {isSubmitting && (
          <div className="absolute inset-0 z-50 !m-0 !p-0 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-[0.2px]">
            <LoadingSpinner1 
              size="lg"
              message={loadingMessage} 
              // subMessage={loadingSubMessage}
              subMessage=''
            />
          </div>
        )}

        {/* Main Grid: Profile on left, Form fields on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Picture Sidebar */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
            <div className="w-full max-w-sm">
                <FormItem>
                  <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-(--border-muted) ring-offset-(--card-bg)">
                        <AvatarImage src={previewImage} alt="Profile" />
                        {/* {previewImage && <AvatarImage src={previewImage} alt="Profile" />} */}
                        <AvatarFallback className="bg-(--brand-primary-light)/20 text-(--brand-primary) text-3xl font-semibold">
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
                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-(--brand-primary) hover:bg-(--brand-primary-hover) shadow-lg"
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
                        <p className="text-xs text-(--text-tertiary)">
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
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter email"
                          className="rounded-xl pr-10"
                          {...field}
                          readOnly={isEditMode && user?.isEmailVerified}
                        />

                        {isEditMode && user?.isEmailVerified && (
                          <CheckCircle
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--status-success)"
                          />
                        )}
                      </div>
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
                render={({ field }) => {
                  const isHostUser = isEditMode && user?.role === "host";

                  return (
                    <FormItem>
                      <FormLabel>Role</FormLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isHostUser}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "rounded-xl",
                              isHostUser && "pointer-events-none opacity-100"
                            )}
                          >
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {/* CREATE MODE → only user & admin */}
                          {!isEditMode && (
                            <>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </>
                          )}

                          {/* EDIT MODE */}
                          {isEditMode && (
                            <>
                              {/* Existing HOST → show only host */}
                              {isHostUser && (
                                <SelectItem value="host">Host</SelectItem>
                              )}

                              {/* SUPER ADMIN → show only Admin */}
                              {user?.isSuperAdmin && (
                                <SelectItem value="admin">Admin</SelectItem>
                              )}

                              {/* Existing USER / ADMIN → allow swap */}
                              {!isHostUser && !user?.isSuperAdmin && (
                                <>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </>
                              )}
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      {isHostUser && (
                        <p className="text-xs text-(--text-tertiary)">
                          <span className="text-(--brand-primary)">*</span> Host role cannot be changed
                        </p>
                      )}

                      {!isEditMode && (
                        <p className="text-xs text-(--text-tertiary)">
                          <span className="text-(--brand-primary)">*</span> Cannot create <span className="font-medium">'host'</span> directly. Use role upgrading feature.
                        </p>
                      )}

                      {isEditMode && !isHostUser && !user?.isSuperAdmin && (
                        <p className="text-xs text-(--text-tertiary)">
                          <span className="text-(--brand-primary)">*</span> Direct role changes to <span className="font-medium text-(--brand-primary)">Host</span> are not permitted. Please use the Role Upgrade Portal.
                        </p>
                      )}

                      {isEditMode && user?.isSuperAdmin && (
                        <p className="text-xs text-(--text-tertiary)">
                          <span className="text-(--brand-primary)">*</span> Super Admin role cannot be changed.
                        </p>
                      )}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => {
                  const isCreateMode = !isEditMode;

                  return (
                    <FormItem>
                      <FormLabel>Status</FormLabel>

                      {/* CREATE MODE → Always Pending */}
                      {isCreateMode && (
                        <FormControl>
                          <Input
                            value="Pending"
                            readOnly
                            className="rounded-xl bg-(--bg-muted)"
                          />
                        </FormControl>
                      )}

                      {/* EDIT MODE → Show existing status (readonly) */}
                      {isEditMode && (
                        <Select value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl pointer-events-none opacity-100">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {isEditMode ? (
                        <p className="text-xs text-(--text-tertiary)"> <span className="text-(--brand-primary)">*</span> Status cannot be changed here </p>
                      ): (
                        <p className="text-xs text-(--text-tertiary)"> <span className="text-(--brand-primary)">*</span> New users are created with 'Pending' status </p>
                      )}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t border-(--border-muted)">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit" 
            className="rounded-xl px-6 bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-white" 
            disabled={isSubmitting}
          >
            <ButtonLoader 
              loading={isSubmitting}
              loadingText={loadingMessage}
            >
            {isEditMode ? "Update User" : "Create User"}
            </ButtonLoader>
          </Button>
        </div>

      </form>
    </Form>
  )
}