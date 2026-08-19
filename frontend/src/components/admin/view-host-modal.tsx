// frontend/src/components/admin/view-host-modal.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { UserState } from "@/types/user.types";
import { formatDate1, formatDate2 } from "@/utils/dateAndTime.utils";
import { getInitials } from "@/utils/namingConventions";
import type { VariantProps } from "class-variance-authority";
import { Button } from "../ui/button";
import { AlertCircle, CheckCircle, Star, Mail, Phone, Building2, FileText } from "lucide-react";
import type { HostStatus, UserStatus } from "@/constants/user-system.constants";
import { StarRating } from "@/components/shared/StarRating";

interface ViewHostModalProps {
  host: UserState
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const hostStatusVariant: Record<HostStatus, BadgeVariant> = {
  pending: "outline",
  approved: "success",
  rejected: "destructive",
  blocked: "destructive",
};

const accountStatusVariant: Record<UserStatus, BadgeVariant> = {
  active: "success",
  blocked: "destructive",
  pending: "outline",
};




export function ViewHostModal({ host }: ViewHostModalProps) {
   return (
      <div className="space-y-8">
         
         {/* 1. Organization Header */}
         <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
         <Avatar className="h-28 w-28 ring-4 ring-offset-4 ring-(--border-muted) ring-offset-(--modal-content-bg)">
            <AvatarImage src={host.organizationLogo} alt={host.organizationName || "Organization Logo"} />
            <AvatarFallback className="bg-(--bg-secondary) text-3xl font-bold text-(--brand-primary)">
               {host.organizationName ? getInitials(host.organizationName) : <Building2 size={40} className="text-(--text-tertiary)" />}
            </AvatarFallback>
         </Avatar>

         <div className="text-center sm:text-left w-full">
            <h3 className="text-2xl font-bold text-(--heading-primary)">
               {host.organizationName || "Unnamed Organization"}
            </h3>

            {/* Ratings */}
            {host.hostStatus === 'approved' && (
               <div className="mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                  <div className="flex items-center gap-1 bg-(--bg-secondary) border border-(--border-default) px-2.5 py-1 rounded-full">
                     <StarRating rating={host.ratingAverage || 0} size={16} />
                     <span className="font-semibold text-sm text-(--text-primary)">
                     {host.ratingAverage ? host.ratingAverage.toFixed(1) : "0.0"}
                     </span>
                  </div>
                  <span className="text-sm text-(--text-tertiary)">
                  ({host.totalReviews || 0} reviews)
                  </span>
               </div>
            )}

            {/* Status Badges */}
            <div className="mt-5 grid grid-cols-2 sm:flex gap-4">
               <div className="flex flex-col gap-1 rounded-xl bg-(--bg-secondary) px-3 py-2 border border-(--border-muted)">
                  <span className="text-[10px] uppercase tracking-wider text-(--text-tertiary) font-semibold">Host Status</span>
                  <Badge
                     variant={host.hostStatus ? hostStatusVariant[host.hostStatus] : "secondary"}
                     className="w-fit rounded-md font-medium capitalize"
                  >
                     {host.hostStatus || "Unknown"}
                  </Badge>
               </div>

               <div className="flex flex-col gap-1 rounded-xl bg-(--bg-secondary) px-3 py-2 border border-(--border-muted)">
                  <span className="text-[10px] uppercase tracking-wider text-(--text-tertiary) font-semibold">Account Status</span>
                  <Badge
                     variant={accountStatusVariant[host.status]}
                     className="w-fit rounded-md font-medium capitalize"
                  >
                     {host.status}
                  </Badge>
               </div>
            </div>
         </div>
         </div>

         {/* 2. Organization Description */}
         {host.organizationDescription && (
            <div className="bg-(--bg-secondary)/50 rounded-xl p-4 border border-(--border-muted)">
               <p className="text-sm font-semibold text-(--text-secondary) mb-2">About Organization</p>
               <p className="text-sm text-(--text-secondary) leading-relaxed">
                  {host.organizationDescription}
               </p>
            </div>
         )}

         {/* 3. Organizer / Owner Details (User Info) */}
         <div className="bg-(--bg-primary) border border-(--border-focus) rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider mb-3">Organizer / Account Owner</p>
            <div className="flex items-center gap-4">
               <Avatar className="h-14 w-14 border border-(--border-muted)">
                  <AvatarImage src={host.profilePic} alt={host.name} />
                  <AvatarFallback className="bg-(--brand-primary-light)/20 text-(--brand-primary) font-medium">
                     {getInitials(host.name)}
                  </AvatarFallback>
               </Avatar>
               <div className="flex-1 min-w-0">
                  <p className="font-medium text-(--text-primary) text-base truncate">{host.name}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                     <div className="flex items-center gap-1.5 text-sm text-(--text-secondary) truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{host.email}</span>
                        {host.isEmailVerified && (
                           <CheckCircle size={14} className="text-(--status-success) shrink-0" aria-label="Verified" />
                        )}
                     </div>
                     <div className="flex items-center gap-1.5 text-sm text-(--text-secondary)">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{host.mobile || "Not provided"}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 4. Main Details Grid */}
         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 bg-(--bg-secondary)/30 p-5 rounded-xl border border-(--border-muted)">
         <div>
            <p className="text-sm text-(--text-tertiary)">Registration Number</p>
            <p className="text-base font-medium text-(--text-primary) mt-1 font-mono">
               {host.registrationNumber || "—"}
            </p>
         </div>

         <div>
            <p className="text-sm text-(--text-tertiary)">Business Address</p>
            <p className="text-base font-medium text-(--text-primary) mt-1">
               {host.businessAddress || "Not provided"}
            </p>
         </div>

         <div>
            <p className="text-sm text-(--text-tertiary)">Member Since</p>
            <p className="text-base font-medium text-(--text-primary) mt-1">
               {formatDate1(host.createdAt)}
            </p>
         </div>

         <div>
            <p className="text-sm text-(--text-tertiary)">Host Application Date</p>
            <p className="text-base font-medium text-(--text-primary) mt-1">
               {host.hostAppliedAt ? formatDate2(host.hostAppliedAt) : "—"}
            </p>
         </div>
         </div>

         {/* 5. Alerts & Documents */}
         <div className="space-y-4">
         {host.hostStatus === "rejected" && host.hostRejectionReason && (
            <div>
               <p className="text-sm font-semibold text-(--status-error) mb-2">Rejection Reason</p>
               <p className="p-3 rounded-lg bg-(--badge-error-bg) text-(--badge-error-text) border border-(--badge-error-border) text-sm">
               {host.hostRejectionReason}
               </p>
            </div>
         )}

         <div>
            <p className="text-sm text-(--text-tertiary) mb-2">Business Certificate</p>
            {host.certificateUrl ? (
               <Button
                  asChild
                  variant="primaryOutline"
                  className="w-fit shadow-sm"
               >
                  <a
                     href={host.certificateUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <FileText className="w-4 h-4 mr-2" />
                     View Registration Certificate
                  </a>
               </Button>
            ) : (
               <div className="flex items-center gap-2 text-sm text-(--status-error) bg-(--badge-error-bg) border border-(--badge-error-border) w-fit px-3 py-2 rounded-lg">
                  <AlertCircle size={16} />
                  <span>No document uploaded yet</span>
               </div>
            )}
         </div>
         </div>

         {/* 6. Footer User ID */}
         <div className="pt-4 border-t border-(--border-muted) text-xs text-(--text-tertiary) font-mono text-center sm:text-left">
         System ID: {host.userId}
         </div>
         
      </div>
   );
}