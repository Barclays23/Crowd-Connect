import { EVENT_STATUSES, EventStatus } from "@/constants/event.constants";
import { EventEntity } from "@/entities/event.entity";
import { EventFilterQuery } from "@/types/event.types";



export interface DateQueryOperator {
  $gt?: Date;
  $gte?: Date;
  $lt?: Date;
  $lte?: Date;
}




// for response: converting DB status into display status
export function getEventDisplayStatus(event: EventEntity): EventStatus {
   const now = new Date();

   if (event.eventStatus === EVENT_STATUSES.DRAFT)     return EVENT_STATUSES.DRAFT;
   if (event.eventStatus === EVENT_STATUSES.CANCELLED) return EVENT_STATUSES.CANCELLED;
   if (event.eventStatus === EVENT_STATUSES.SUSPENDED) return EVENT_STATUSES.SUSPENDED;

   // if eventStatus is 'published', then,
   if (event.startDateTime > now) return EVENT_STATUSES.UPCOMING;
   if (now >= event.startDateTime && now < event.endDateTime) return EVENT_STATUSES.ONGOING;

   return EVENT_STATUSES.COMPLETED;
   // Return this as a virtual field in API responses (e.g., event.displayStatus
   // In API: Always include displayStatus in responses.
   // There is no "published" status. It is converted into "upcoming" & "ongoing"
}






// for request: converting display status to DB status and event timings.
export function applyEventStatusFilter(query: EventFilterQuery, status?: EventStatus) {
   if (!status) return;

   const now = new Date();

   switch (status) {
      case EVENT_STATUSES.DRAFT:
      case EVENT_STATUSES.CANCELLED:
      case EVENT_STATUSES.SUSPENDED:
         query.eventStatus = status;
         break;

      case EVENT_STATUSES.UPCOMING:
         query.eventStatus = EVENT_STATUSES.PUBLISHED;
         query.startDateTime = { $gt: now };
         break;

      case EVENT_STATUSES.ONGOING:
         query.eventStatus = EVENT_STATUSES.PUBLISHED;
         query.startDateTime = { $lte: now };
         query.endDateTime = { $gt: now };
         break;

      case EVENT_STATUSES.COMPLETED:
         query.eventStatus = EVENT_STATUSES.PUBLISHED;
         query.endDateTime = { $lte: now };
         break;

      case EVENT_STATUSES.PUBLISHED:
         query.eventStatus = EVENT_STATUSES.PUBLISHED;
         break;
   }

}



