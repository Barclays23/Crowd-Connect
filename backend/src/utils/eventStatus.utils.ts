
export function getEventDisplayStatus(event: IEvent): string {
   const now = new Date();

   // or EventStatus.DRAFT enum
   if (event.status === EVENT_STATUS.DRAFT)     return "draft";
   if (event.status === EVENT_STATUS.CANCELLED) return "cancelled";
   if (event.status === EVENT_STATUS.SUSPENDED) return "suspended";

   if (event.startDateTime > now) return 'upcoming';
   if (event.endDateTime <= now) return 'ongoing';

   return 'completed';
   // Return this as a virtual field in API responses (e.g., event.displayStatus
   // In API: Always include displayStatus in responses.
}
