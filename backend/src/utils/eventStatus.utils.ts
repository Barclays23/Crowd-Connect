import { EVENT_STATUS, IEventModel } from "@/types/event.types";


export function getEventDisplayStatus(event: IEventModel): string {
   const now = new Date();

   if (event.eventStatus === EVENT_STATUS.DRAFT)     return "draft";
   if (event.eventStatus === EVENT_STATUS.CANCELLED) return "cancelled";
   if (event.eventStatus === EVENT_STATUS.SUSPENDED) return "suspended";

   if (event.startDateTime > now) return 'upcoming';
   if (event.endDateTime <= now) return 'ongoing';

   return 'completed';
   // Return this as a virtual field in API responses (e.g., event.displayStatus
   // In API: Always include displayStatus in responses.
   // There is no "published" status. It is converted into "upcoming" & "ongoing"
}
