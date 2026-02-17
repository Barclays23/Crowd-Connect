import type { EVENT_STATUS } from "@/types/event.types";


export const getUserStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active": return "success";
    case "blocked": return "destructive";
    case "pending": return "outline";
    default: return "secondary";
  }
};



export const getEventStatusBadgeVariant = (status: EVENT_STATUS) => {
  switch (status) {
      case "draft":
        return "secondary";
      case "upcoming":
      case "ongoing":
        return "success";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
  }
};




