import { POSTER_MAX_FILE_SIZE, POSTER_IMAGE_TYPES, EVENT_CATEGORIES } from "@/types/event.types";
import { parseISODateTime } from "@/utils/dateAndTimeFormats";
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
   .enum(EVENT_CATEGORIES, "Please choose an event category from the list"
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






export const formatBase = z
   .enum(["offline", "online"], "Invalid event format");



export const ticketTypeBase = z
   .enum(["free", "paid"], "Invalid ticket type");



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
   .optional();



export const coordinatesBase = z
   .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
   })
   .optional();




export const imageFileBase = z
   .custom<File>((val) => val instanceof File, "Invalid file")
   .refine((file) => file && file.size <= POSTER_MAX_FILE_SIZE, {
      message: "Banner image must be less than 5MB",
   })
   .refine((file) => file && POSTER_IMAGE_TYPES.includes(file.type), {
      message: "Only JPG, PNG, and WEBP images are allowed",
   })
   .optional()
   .nullable();



export const aiUrlBase = z
   .string()
   .url("Invalid AI image URL")
   .optional()
   .nullable();





/* ---------- Event Form Schema ---------- */
export const eventFormSchema = z.object({
   title: titleBase,
   description: descriptionBase,
   category: categoryBase,

   // Date & Time
   startDate: dateBase("Start"),
   startTime: timeBase("Start"),
   endDate: dateBase("End"),
   endTime: timeBase("End"),

   // Enums
   format: formatBase,
   ticketType: ticketTypeBase,

   // Location
   locationName: locationNameBase,
   locationCoordinates: coordinatesBase,

   // Pricing
   ticketPrice: priceBase,
   capacity: capacityBase,

   // Media
   uploadedImage: imageFileBase,
   aiGeneratedImage: aiUrlBase,
   useAI: z.boolean(),
})
.superRefine((data, ctx) => {
   
   // 1. Date Validation: End must be after Start
   const today = new Date();
   const start = parseISODateTime(data.startDate, data.startTime);
   const end = parseISODateTime(data.endDate, data.endTime);

   if (isNaN(start.getTime())) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "Invalid start date or time",
         path: ["startDate"],
      });
   }

   if (isNaN(end.getTime())) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "Invalid end date or time",
         path: ["endDate"],
      });
   }

   if (start < today) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "Start date & time cannot be in the past",
         path: ["startDate"],
      });
   }

   if (end <= start) {
         ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "End date must be after start date",
         path: ["endDate"], 
      });
   }

   if (data.startDate === data.endDate && end <= start) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "End time must be after start time",
         path: ["endTime"],
      });
   }

   // 2. Location Validation: Required if IN-PERSON
   if (data.format === "offline") {
      if (!data.locationName || data.locationName.trim().length < 3) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Venue location is required for offline events",
            path: ["locationName"],
         });
      }
      // Ensure coordinates were actually selected (not just typed text)
      if (!data.locationCoordinates) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select a valid location from the suggestions",
            path: ["locationName"],
         });
      }
   }

   // 3. Price Validation: Required if PAID
   if (data.ticketType === "paid" && data.ticketPrice <= 0) {
         ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "Ticket price shouldn't be 0 for paid events",
         path: ["ticketPrice"],
      });
   }

   // 4. Banner Validation: Must have either File OR AI Image
   const hasManualUploadImage = data.uploadedImage instanceof File;
   const hasAiImage = 
      data.useAI &&
      typeof data.aiGeneratedImage === "string" &&
      data.aiGeneratedImage.length > 10;


   if (!hasManualUploadImage && !hasAiImage) {
         ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "Please upload a banner or generate one using AI",
         path: ["uploadedImage"],
      });
   }
});

// Export the type for use in React Hook Form
export type EventFormValues = z.infer<typeof eventFormSchema>;