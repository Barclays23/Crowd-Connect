// backend/src/schemas/event.schema.ts

import { ALL_EVENT_CATEGORIES, EVENT_FORMAT, TICKET_TYPE } from "@/types/event.types";
import { z } from "zod";


/* ---------- Base Fields ---------- */
export const titleBase = z
   .string()
   .trim()
   .min(1, "Event title is required")
   // prevent symbol spam at the start
   .refine(
      (value) => !/^[^A-Za-z0-9]/.test(value), "Event title cannot start with special characters",
   )
   .min(5, "Title must be at least 5 characters")
   .max(30, "Title cannot exceed 30 characters")
   .regex(
      /^[A-Za-z0-9\s&.,'\-()]+$/,
      "Event title can contain only letters, numbers, spaces, and basic punctuation (&.,'-)"
   )
   .refine(
      (value) => /[A-Za-z]{2,}/.test(value), "Event Title must contain meaningful letters",
   )
   // limit special characters dominance
   .refine((value) => {
      const total = value.length;
      const specialCount =
         (value.match(/[^A-Za-z0-9\s]/g) || []).length;
      return specialCount / total <= 0.3; // max 30%
   }, {
      message: "Title contains too many special characters",
   })
   // prevent symbol spam at the start
   .refine(
      (value) => !/^[^A-Za-z0-9]{3,}/.test(value), "Title cannot start with excessive special characters",
   );





export const descriptionBase = z
   .string()
   .trim()
   .min(1, "Description is required")
   // prevent symbol spam at the start
   .refine(
      (value) => !/^[^A-Za-z0-9]/.test(value), "Description cannot start with special characters",
   )
   .min(20, "Description must be at least 20 characters")
   .max(500, "Description cannot be more than 500 characters")
   .regex(
      /\b[A-Za-z]{3,}\b/,
      "Description must contain meaningful words"
   )
   // limit special characters dominance
   .refine((value) => {
      const total = value.length;
      const specialCount = (value.match(/[^A-Za-z0-9\s.,'()-]/g) || []).length;
      return specialCount / total <= 0.3; // 30%
   }, {
      message: "Description contains too many special characters"
   })




export const categoryBase = z
   .enum(ALL_EVENT_CATEGORIES, "Please choose an event category from the list"
);





export const dateBase = (label: "Start" | "End") => z
   .string()
   .min(1, `${label} date is required`)
   .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      "Invalid date format (YYYY-MM-DD)"
   );


export const timeBase = (label: "Start" | "End") => z
   .string()
   .min(1, `${label} time is required`)
   .refine(
      (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val),
      `Invalid ${label} time`
   );





const isoDateTime = z
  .string()
  .datetime({ offset: true, message: "Invalid ISO datetime format" });


export const formatBase = z
   .enum(EVENT_FORMAT, "Invalid event format");



export const ticketTypeBase = z
   .enum(TICKET_TYPE, "Invalid ticket type");



export const priceBase = z.coerce
   .number()
   .finite()
   .nonnegative("Price cannot be negative")
   .min(0, "Price must be at least 0");



export const capacityBase = z.coerce
   .number()
   .int()
   .nonnegative("Capacity cannot be negative")
   .min(1, "Capacity must be at least 1")
   .max(100000, "Capacity exceeds allowed limit");




export const locationNameBase = z
   .string()
   .trim()
   .min(1)
   .optional();





const geoJsonPointSchema = z.object({
   type: z.literal("Point"),
   coordinates: z
      .array(z.number())
      .length(2, "Location must have longitude and latitude"),
});



export const coordinatesBase = z.preprocess(
   (val) => {
      if (val === "" || val === "null" || val === undefined) {
         return undefined;
      }

      if (typeof val === "string") {
         try {
            return JSON.parse(val);
         } catch {
            return undefined;
         }
      }

      // Convert { lat, lng } → GeoJSON
      if (typeof val === "object" && val !== null && "lat" in val && "lng" in val) {
         return {
         type: "Point",
         coordinates: [Number(val.lng), Number(val.lat)],
         };
      }
      return val;
   },
   geoJsonPointSchema.optional()
)






// export const imageFileBase = z
//    .custom<File>((val) => val instanceof File, "Invalid file")
//    .refine((file) => file && file.size <= POSTER_MAX_FILE_SIZE, {
//       message: "Banner image must be less than 5MB",
//    })
//    .refine((file) => file && POSTER_IMAGE_TYPES.includes(file.type), {
//       message: "Only JPG, PNG, and WEBP images are allowed",
//    })
//    .optional()
//    .nullable();



export const aiUrlBase = z
   .string()
   .url("Invalid AI image URL")
   .optional()
   .nullable();





/* ---------- Event Form Schema ---------- */
export const EventFormSchema = z.object({
   title: titleBase,
   category: categoryBase,
   description: descriptionBase,

   // Date & Time
   startDateTime: isoDateTime,
   endDateTime: isoDateTime,
   // startDate: dateBase("Start"),
   // startTime: timeBase("Start"),
   // endDate: dateBase("End"),
   // endTime: timeBase("End"),

   // Enums
   format: formatBase,
   ticketType: ticketTypeBase,

   // Location
   locationName: locationNameBase,
   location: coordinatesBase,

   // Pricing
   ticketPrice: priceBase,
   capacity: capacityBase,

   // Media
   // uploadedImage: imageFileBase,  (file is not validating with zod. let the multer handle in backend)
   aiGeneratedImage: aiUrlBase,
})
.superRefine((data, ctx) => {
   
   // 1. Date Validation: End must be after Start
   // Server timezone ≠ user timezone
   const now = Date.now();
   const start = Date.parse(data.startDateTime);
   const end = Date.parse(data.endDateTime);

   if (Number.isNaN(start)) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         path: ["startDateTime"],
         message: "Invalid start date or time",
      });
   }

   if (Number.isNaN(end)) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         path: ["endDateTime"],
         message: "Invalid end date or time",
      });
   }

   if (Number.isNaN(start) || Number.isNaN(end)) {
      return;
   }

   const BUFFER_MS = 60 * 1000;

   if (start < now - BUFFER_MS) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         path: ["startDateTime"],
         message: "Start date & time cannot be in the past",
      });
   }


   if (end <= start) {
         ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "End date & time must be after start date & time",
         path: ["endDateTime"], 
      });
   }

   // if (data.startDate === data.endDate && end <= start) {
   //    ctx.addIssue({
   //       code: z.ZodIssueCode.custom,
   //       message: "End time must be after start time",
   //       path: ["endTime"],
   //    });
   // }

   // 2. Location Validation: Required if IN-PERSON
   if (data.format === EVENT_FORMAT.OFFLINE) {
      if (!data.locationName) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["locationName"],
            message: "Venue location is required for offline events",
         });
      }
      // Ensure coordinates were actually selected (not just typed text)
      if (!data.location) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["locationCoordinates"],
            message: "You must choose a valid location for offline events.",
         });
      }
   }

   // 3. Price Validation: Required if PAID
   if (data.ticketType === TICKET_TYPE.PAID && data.ticketPrice <= 0) {
         ctx.addIssue({
         code: z.ZodIssueCode.custom,
         path: ["ticketPrice"],
         message: "Paid events must have a valid ticket price.",
      });
   }


});