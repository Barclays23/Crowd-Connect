// src/components/event/EventDateTimeSection.tsx
import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "../shared/FieldError";
import { EventDurationBadge } from "@/components/event/EventDurationBadge";
import { type EventFormValues } from "@/schemas/event.schema";





export const EventDateTimeSection = () => {
   const { register, watch, formState: { errors } } = useFormContext<EventFormValues>();

   const watchedStartDate = watch("startDate");
   const watchedStartTime = watch("startTime");
   const watchedEndDate = watch("endDate");
   const watchedEndTime = watch("endTime");

   const startStr = watchedStartDate && watchedStartTime ? `${watchedStartDate}T${watchedStartTime}:00` : null;
   const endStr = watchedEndDate && watchedEndTime ? `${watchedEndDate}T${watchedEndTime}:00` : null;

   const startDateRef = useRef<HTMLInputElement>(null);
   const startTimeRef = useRef<HTMLInputElement>(null);
   const endDateRef = useRef<HTMLInputElement>(null);
   const endTimeRef = useRef<HTMLInputElement>(null);

   const { ref: startDateHookRef, ...startDateRest } = register("startDate");
   const { ref: startTimeHookRef, ...startTimeRest } = register("startTime");
   const { ref: endDateHookRef, ...endDateRest } = register("endDate");
   const { ref: endTimeHookRef, ...endTimeRest } = register("endTime");

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
            <Calendar className="w-5 h-5 text-(--brand-primary)" /> Date & Time
         </h3>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
               <Label className="text-xs font-bold text-(--text-secondary) uppercase">Starts</Label>
               <div className="relative">
                  <Input
                     type="date"
                     {...startDateRest}
                     ref={(e) => {
                        startDateHookRef(e);
                        startDateRef.current = e;
                     }}
                     className="pr-10"
                  />
                  <Calendar
                     onClick={() => startDateRef.current?.showPicker()}
                     className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                  />
               </div>
               <div className="relative">
                  <Input
                     type="time"
                     {...startTimeRest}
                     ref={(e) => {
                        startTimeHookRef(e);
                        startTimeRef.current = e;
                     }}
                     className="pr-10"
                  />
                  <Clock
                     onClick={() => startTimeRef.current?.showPicker()}
                     className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                  />
               </div>
               <FieldError message={errors.startDate?.message} />
               <FieldError message={errors.startTime?.message} />
            </div>

            <div className="space-y-3">
               <Label className="text-xs font-bold text-(--text-secondary) uppercase">Ends</Label>
               <div className="relative">
                  <Input
                     type="date"
                     {...endDateRest}
                     ref={(e) => {
                        endDateHookRef(e);
                        endDateRef.current = e;
                     }}
                     className="pr-10"
                  />
                  <Calendar
                     onClick={() => endDateRef.current?.showPicker()}
                     className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                  />
               </div>
               <div className="relative">
                  <Input
                     type="time"
                     {...endTimeRest}
                     ref={(e) => {
                        endTimeHookRef(e);
                        endTimeRef.current = e;
                     }}
                     className="pr-10"
                  />
                  <Clock
                     onClick={() => endTimeRef.current?.showPicker()}
                     className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                  />
               </div>
               <FieldError message={errors.endDate?.message} />
               <FieldError message={errors.endTime?.message} />
            </div>
         </div>

         <EventDurationBadge startDateTime={startStr} endDateTime={endStr} className="mt-2" />
      </div>
   );
};