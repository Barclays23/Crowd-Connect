import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate1 } from "@/utils/dateAndTimeFormats";
import { capitalize, getInitials } from "@/utils/namingConventions";
import { AlertCircle, CheckCircle } from "lucide-react";


interface ViewUserModalProps {
  user: {
    userId: string;
    name: string;
    email: string;
    mobile: string;
    role: "admin" | "host" | "user";
    status: "active" | "blocked" | "pending";
    isEmailVerified: boolean;
    createdAt: string;
    profilePic?: string;
  };
}

const roleVariant = {
  admin: "brand" as const,
  host: "primary" as const,
  user: "neutral" as const,
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active": return "success";
    case "blocked": return "destructive";
    case "pending": return "outline";
    default: return "secondary";
  }
};



export function ViewUserModal({ user }: ViewUserModalProps) {
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <Avatar className="h-28 w-28 ring-4 ring-(--bg-primary) ring-offset-4 ring-offset-(--modal-content-bg)">
          <AvatarImage src={user.profilePic} alt={user.name} />
          <AvatarFallback className="bg-(--brand-primary-light)/30 text-3xl font-bold text-(--brand-primary)">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="text-center sm:text-left">
          <h3 className="text-2xl font-bold text-(--heading-primary)">
            {user.name}
          </h3>
          <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
            <p className="text-(--text-secondary)">
              {user.email}
            </p>
            {user.isEmailVerified ? (
              <CheckCircle className="h-4 w-4 text-(--status-success)" />
            ) : (
              <AlertCircle size={14} className="h-4 w-4 text-(--status-error)" />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
            <Badge variant={roleVariant[user.role.toLowerCase() as keyof typeof roleVariant]} className="rounded-lg font-medium">
              {capitalize(user.role)}
            </Badge>
            <Badge variant={getStatusBadgeVariant(user.status)} className="rounded-lg font-medium">
              {capitalize(user.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-(--text-tertiary)">Phone Number</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1">
            {user.mobile || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-sm text-(--text-tertiary)">Member Since</p>
          <p className="text-lg font-medium text-(--text-primary) mt-1">
            {formatDate1(user.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-sm text-(--text-tertiary)">User ID</p>
          <p className="text-sm font-mono text-(--text-secondary) mt-1 break-all">
            {user.userId}
          </p>
        </div>
      </div>

      {/* Additional sections can be added here later (e.g., activity, bookings, etc.) */}
    </div>
  );
}