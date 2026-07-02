// src/utils/payload-utils/eventPayload.utils.ts

import { EVENT_FORMATS } from "@/constants/event.constants";
import type { EventFormValues } from "@/schemas/event.schema";
import { combineDateAndTime } from "@/utils/dateAndTimeFormats";

// FOR CREATING AND UPDATING EVENTS (BY HOST AND ADMIN DASHBOARDS)
export const buildEventFormData = (data: EventFormValues) => {
   const startDateTime = combineDateAndTime(data.startDate, data.startTime);
   const endDateTime = combineDateAndTime(data.endDate, data.endTime);

   const payload = new FormData();

   payload.append("title", data.title);
   payload.append("description", data.description);
   payload.append("category", data.category);
   payload.append("format", data.format);
   payload.append("ticketType", data.ticketType);
   payload.append("ticketPrice", String(data.ticketPrice || 0));
   payload.append("capacity", String(data.capacity));
   payload.append("startDateTime", startDateTime);
   payload.append("endDateTime", endDateTime);

   if (data.locationName) {
      payload.append("locationName", data.locationName);
   }


   if (data.format === EVENT_FORMATS.OFFLINE) {
      payload.append("locationName", data.locationName || "");

      if (data.locationCoordinates) {
         console.log('data.locationCoordinates :', data.locationCoordinates)
         payload.append(
            "location",
            JSON.stringify({
               type: "Point",
               coordinates: [data.locationCoordinates.lng, data.locationCoordinates.lat],
            })
         );
      }
   }

   // Image Logic
   if (data.useAI && data.aiGeneratedImage) {
      // payload.append("aiPosterData", data.aiGeneratedImage); // base64 data URL
      payload.append("aiGeneratedImage", data.aiGeneratedImage); // base64 data URL
   } else if (data.uploadedImage) {
      payload.append("eventPosterImage", data.uploadedImage); // File
   }

   console.log("EVENT FORM DATA PAYLOAD :", Object.fromEntries(payload.entries()));

   return payload;
};