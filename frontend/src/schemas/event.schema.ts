// frontend/src/schemas/event.schema.ts
import { MS_PER_DAY } from "@/constants/dateAndTime.constants";
import { 
   EVENT_CATEGORIES, 
   EVENT_FORMATS, 
   EVENT_STATUSES, 
   MAX_ADVANCE_YEARS, 
   MAX_DURATION_DAYS, 
   TICKET_TYPES, 
   type EventStatus 
} from "@/constants/event.constants";
import { 
   POSTER_MAX_FILE_SIZE, 
   POSTER_IMAGE_TYPES 
} from "@/types/event.types";
import { parseISODateTime } from "@/utils/dateAndTime.utils";
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
   .max(50, "Title cannot exceed 50 characters")
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




// export const categoryBase = z
//    .enum(EVENT_CATEGORIES, "Please choose an event category from the list"
// );

export const categoryBase = z
   // Accept any initial state (like undefined from RHF) so Zod doesn't abort object parsing early
   .any()
   .refine(
      (val) => EVENT_CATEGORIES.includes(val), 
      "Please choose an event category from the list"
   ) as unknown as z.ZodType<typeof EVENT_CATEGORIES[number]>; // Preserves your strict TS typings





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
   .enum([EVENT_FORMATS.OFFLINE, EVENT_FORMATS.ONLINE], "Invalid event format");



export const ticketTypeBase = z
   .enum([TICKET_TYPES.FREE, TICKET_TYPES.PAID], "Invalid ticket type");



export const priceBase = z.coerce
   .number()
   .finite()
   .nonnegative("Price cannot be negative")
   .min(0, "Ticket price required");




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



export const base64ImageBase = z
   .string()
   .refine((val) => val.startsWith("data:image/"), {
       message: "Must be a valid base64 image string",
   })
   .optional()
   .nullable();




export const agreeTermsBase = z
   .boolean()
   .refine((val) => val === true, {
      message: "You must agree to the Host Guidelines & Terms of Service.",
   });


export const rejectReasonBase = z
   .string()
   .trim()
   .min(1, "You must provide the reason to suspend event.")
   // prevent symbol spam at the start
   .refine(
      (value) => !/^[^A-Za-z0-9]/.test(value), "Reason cannot start with special characters",
   )
   .min(20, "Reason must be at least 20 characters")
   .max(500, "Reason cannot be more than 500 characters")
   .regex(
      /\b[A-Za-z]{3,}\b/,
      "Reason must contain meaningful words"
   )
   // limit special characters dominance
   .refine((value) => {
      const total = value.length;
      const specialCount = (value.match(/[^A-Za-z0-9\s.,'()-]/g) || []).length;
      return specialCount / total <= 0.3; // 30%
   }, {
      message: "Reason contains too many special characters"
   })





/* ---------- Event Form Schema ---------- */
export const eventFormSchemaFactory = (
   isEditWithExistingImage = false, 
   isEditMode = false, 
   eventStatus?: EventStatus
) =>
   z.object({
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
      aiGeneratedImage: base64ImageBase,
      useAI: z.boolean(),
      agreeTerms: agreeTermsBase,
   })
   .superRefine((data, ctx) => {
      
      // 1. Date Validation: End must be after Start
      const today = new Date();
      const start = parseISODateTime(data.startDate, data.startTime);
      const end = parseISODateTime(data.endDate, data.endTime);

      const isValidStart = !isNaN(start.getTime());
      const isValidEnd = !isNaN(end.getTime());

      if (!isValidStart) {
         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid start date or time", path: ["startDate"] });
      }

      if (!isValidEnd) {
         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid end date or time", path: ["endDate"] });
      }


      // Validations that depend on a valid Start Date
      if (isValidStart) {
         // ✅ Only block past start date when creating, not when editing
         if (!isEditMode && start < today) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start date & time cannot be in the past", path: ["startDate"] });
         }

         if (isEditMode && eventStatus === EVENT_STATUSES.DRAFT && start < today) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "The start date/time has passed. Please choose a future date & time.", path: ["startDate"] });
         }

         const maxFutureDate = new Date();
         maxFutureDate.setFullYear(today.getFullYear() + MAX_ADVANCE_YEARS);

         if (start > maxFutureDate) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Event cannot be scheduled more than ${MAX_ADVANCE_YEARS} years in advance`, path: ["startDate"] });
         }
      }

      // Validations that depend on a valid End Date
      if (isValidEnd) {
         if (end < today) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date & time cannot be in the past", path: ["endDate"] });
         }
      }

      // Cross-Field Validations (Requires both to be valid)
      if (isValidStart && isValidEnd) {
         if (end <= start) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date", path: ["endDate"] });
         }

         if (data.startDate === data.endDate && end <= start) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time must be after start time", path: ["endTime"] });
         }

         const durationInDays = (end.getTime() - start.getTime()) / MS_PER_DAY;
         if (durationInDays > MAX_DURATION_DAYS) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Event duration cannot exceed ${MAX_DURATION_DAYS} days`, path: ["endDate"] });
         }
      }



      // 2. Location Validation: Required if IN-PERSON
      if (data.format === EVENT_FORMATS.OFFLINE) {
         if (!data.locationName || data.locationName.trim().length < 3) {
            ctx.addIssue({
               code: z.ZodIssueCode.custom,
               message: `Venue location is required for ${EVENT_FORMATS.OFFLINE} events`,
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
      if (data.ticketType === TICKET_TYPES.PAID && data.ticketPrice < 1) {
            ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Ticket price should be at least ₹1 for ${TICKET_TYPES.PAID} events`,
            path: ["ticketPrice"],
         });
      }

      // 4. Poster Validation: Must have either File OR AI Image
      if (!isEditWithExistingImage) {
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
      }

   });







export const suspendEventSchema = z.object({
  reason: rejectReasonBase
});


// Export the type for use in React Hook Form
export const createEventFormSchema = eventFormSchemaFactory(false, false); // banner required, past blocked
export const editEventFormSchema   = eventFormSchemaFactory(true,  true);  // banner optional, past allowed
export type EventFormValues = z.infer<ReturnType<typeof eventFormSchemaFactory>>;
export type SuspendEventFormValues = z.infer<typeof suspendEventSchema>;