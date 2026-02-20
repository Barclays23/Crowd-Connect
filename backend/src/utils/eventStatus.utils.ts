import { EventEntity } from "@/entities/event.entity";
import { EVENT_STATUS, EventFilterQuery } from "@/types/event.types";



export interface DateQueryOperator {
  $gt?: Date;
  $gte?: Date;
  $lt?: Date;
  $lte?: Date;
}




// for response: converting DB status into display status
export function getEventDisplayStatus(event: EventEntity): EVENT_STATUS {
   const now = new Date();

   if (event.eventStatus === EVENT_STATUS.DRAFT)     return EVENT_STATUS.DRAFT;
   if (event.eventStatus === EVENT_STATUS.CANCELLED) return EVENT_STATUS.CANCELLED;
   if (event.eventStatus === EVENT_STATUS.SUSPENDED) return EVENT_STATUS.SUSPENDED;

   // if eventStatus is 'published', then,
   if (event.startDateTime > now) return EVENT_STATUS.UPCOMING;
   if (now >= event.startDateTime && now < event.endDateTime) return EVENT_STATUS.ONGOING;

   return EVENT_STATUS.COMPLETED;
   // Return this as a virtual field in API responses (e.g., event.displayStatus
   // In API: Always include displayStatus in responses.
   // There is no "published" status. It is converted into "upcoming" & "ongoing"
}






// for request: converting display status to DB status and event timings.
export function applyEventStatusFilter(query: EventFilterQuery, status?: EVENT_STATUS) {
   if (!status) return;

   const now = new Date();

   switch (status) {
      case EVENT_STATUS.DRAFT:
      case EVENT_STATUS.CANCELLED:
      case EVENT_STATUS.SUSPENDED:
         query.eventStatus = status;
         break;

      case EVENT_STATUS.UPCOMING:
         query.eventStatus = EVENT_STATUS.PUBLISHED;
         query.startDateTime = { $gt: now };
         break;

      case EVENT_STATUS.ONGOING:
         query.eventStatus = EVENT_STATUS.PUBLISHED;
         query.startDateTime = { $lte: now };
         query.endDateTime = { $gt: now };
         break;

      case EVENT_STATUS.COMPLETED:
         query.eventStatus = EVENT_STATUS.PUBLISHED;
         query.endDateTime = { $lte: now };
         break;

      case EVENT_STATUS.PUBLISHED:
         query.eventStatus = EVENT_STATUS.PUBLISHED;
         break;
   }

}



