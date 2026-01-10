// frontend/src/components/admin/view-host-modal.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { HostStatus, UserState, UserStatus } from "@/types/user.types";
import { formatDate1, formatDate2 } from "@/utils/dateAndTimeFormats";
import { capitalize, getInitials } from "@/utils/namingConventions";
import type { VariantProps } from "class-variance-authority";
import { Button } from "../ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";


interface ViewHostModalProps {
  // host: {
  //   userId: string;
  //   name: string;
  //   email: string;
  //   mobile?: string;
  //   profilePic?: string;
  //   status: UserStatus; // account status
  //   isEmailVerified: boolean;

  //   organizationName?: string;
  //   registrationNumber?: string;
  //   businessAddress?: string;
  //   certificateUrl?: string;
  //   hostStatus: HostStatus;
  //   hostAppliedAt?: string;
  //   hostReviewedAt?: string;
  //   hostRejectionReason?: string;
  //   createdAt: string;
  // };

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
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-28 w-28 ring-4 ring-offset-4 ring-(--border-muted) ring-offset-(--modal-content-bg)">
          <AvatarImage src={host.profilePic} alt={host.name} />
          <AvatarFallback className="bg-(--brand-primary-light)/30 text-3xl font-bold text-(--brand-primary)">
            {getInitials(host.name)}
          </AvatarFallback>
        </Avatar>

        <div className="text-center sm:text-left">
          <h3 className="text-2xl font-bold text-(--heading-primary)">{host.name}</h3>

          <div className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-(--text-secondary)">
            <span>{host.email}</span>
            {host.isEmailVerified ? (
              <CheckCircle
                size={16}
                className="text-(--status-success)"
                aria-label="Email verified"
              />
            ) : (
              <AlertCircle
                size={16}
                className="text-(--status-error)"
                aria-label="Email not verified"
              />
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Role */}
            <div className="flex flex-col gap-1 rounded-xl px-2 py-3">
              <span className="text-xs text-(--text-tertiary)">Role</span>
              <Badge variant="primary" className="w-fit rounded-md font-medium">
                Host
              </Badge>
            </div>

            {/* Host Status */}
            <div className="flex flex-col gap-1 rounded-xl px-2 py-3">
              <span className="text-xs text-(--text-tertiary)">Host Status</span>
              <Badge
                variant={host.hostStatus ? hostStatusVariant[host.hostStatus] : "secondary"}
                className="w-fit rounded-md font-medium capitalize"
              >
                {host.hostStatus || "Unknown"}
              </Badge>
            </div>

            {/* Account Status */}
            <div className="flex flex-col gap-1 rounded-xl px-2 py-3">
              <span className="text-xs text-(--text-tertiary)">Account Status</span>
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

      {/* Main Details Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm text-(--text-tertiary)">Organization Name</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1">
            {host.organizationName || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-sm text-(--text-tertiary)">Registration Number</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1 font-mono">
            {host.registrationNumber || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-(--text-tertiary)">Business Address</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1">
            {host.businessAddress || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-sm text-(--text-tertiary)">Phone Number</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1">
            {host.mobile || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-sm text-(--text-tertiary)">Member Since</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1">
            {formatDate1(host.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-sm text-(--text-tertiary)">Application Date</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1">
            {host.hostAppliedAt ? formatDate2(host.hostAppliedAt) : "—"}
          </p>
        </div>

        {/* {host.hostReviewedAt && (
          <div>
            <p className="text-sm text-(--text-tertiary)">Reviewed Date</p>
            <p className="text-lg font-medium text-(--text-primary) mt-1">
              {formatDate2(host.hostReviewedAt)}
            </p>
          </div>
        )} */}

        {host.hostStatus === "rejected" && host.hostRejectionReason && (
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-(--text-tertiary)">Rejection Reason</p>
            <p className="mt-1 p-3 rounded-lg
                bg-(--badge-error-bg)
                text-(--badge-error-text)
                border border-(--badge-error-border)">
                {host.hostRejectionReason}
            </p>
          </div>
        )}

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-sm text-(--text-tertiary) mb-2">Business Certificate</p>
          {host.certificateUrl ? (
              <Button
                asChild
                variant="primaryOutline"
                className="w-fit"
              >
                <a
                  href={host.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Certificate →
                </a>
              </Button>
          ) : (
              <div className="flex items-center gap-2 text-sm text-(--status-error)">
                <AlertCircle size={16} />
                <span>No document uploaded yet</span>
              </div>
          )}
        </div>

      </div>

      {/* User ID (footer style) */}
      <div className="pt-4 border-t border-(--border-muted) text-sm text-(--text-tertiary) font-mono break-all">
        User ID: {host.userId}
      </div>
    </div>
  );
}