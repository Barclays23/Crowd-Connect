// src/components/event/EventBasicDetailsSection.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextArea } from "@/components/ui/text-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "../shared/FieldError";
import { EVENT_CATEGORIES } from "@/constants/event.constants";
import { type EventFormValues } from "@/schemas/event.schema";




export const EventBasicDetailsSection = () => {
   const { register, watch, setValue, formState: { errors } } = useFormContext<EventFormValues>();
   const currentCategory = watch("category");

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
            <FileText className="w-5 h-5 text-(--brand-primary)" /> Basic Details
         </h3>

         <div>
            <Label className="block mb-2 text-(--text-primary)">Event Title *</Label>
            <Input {...register("title")} placeholder="e.g. The Future of Tech 2026" />
            <FieldError message={errors.title?.message} />
         </div>

         <div>
            <Label className="block mb-2 text-(--text-primary)">Category *</Label>
            <Select
               value={currentCategory ?? ""}
               onValueChange={(val) =>
                  setValue("category", val as typeof EVENT_CATEGORIES[number], { shouldValidate: true, shouldDirty: true })
               }
            >
               <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
               </SelectTrigger>
               <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                     <SelectItem key={cat} value={cat}>
                        {cat}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <FieldError message={errors.category?.message} />
         </div>

         <div>
            <Label className="block mb-2 text-(--text-primary)">Description *</Label>
            <TextArea {...register("description")} rows={4} placeholder="Describe your event..." />
            <FieldError message={errors.description?.message} />
         </div>
      </div>
   );
};