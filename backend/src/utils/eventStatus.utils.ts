import { EventEntity } from "@/entities/event.entity";
import { EVENT_STATUS } from "@/types/event.types";


export function getEventDisplayStatus(event: EventEntity): EVENT_STATUS {
   const now = new Date();

   if (event.eventStatus === EVENT_STATUS.DRAFT)     return EVENT_STATUS.DRAFT;
   if (event.eventStatus === EVENT_STATUS.CANCELLED) return EVENT_STATUS.CANCELLED;
   if (event.eventStatus === EVENT_STATUS.SUSPENDED) return EVENT_STATUS.SUSPENDED;

   if (event.startDateTime > now) return EVENT_STATUS.UPCOMING;
   if (now >= event.startDateTime && now < event.endDateTime) return EVENT_STATUS.ONGOING;

   return EVENT_STATUS.COMPLETED;
   // Return this as a virtual field in API responses (e.g., event.displayStatus
   // In API: Always include displayStatus in responses.
   // There is no "published" status. It is converted into "upcoming" & "ongoing"
}
