// src/components/host/event/EventPricingCapacitySection.tsx

import { useFormContext } from "react-hook-form";
import { Tag, Users, IndianRupee, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FieldError } from "../shared/FieldError";
import { type EventFormValues } from "@/schemas/event.schema";

interface EventPricingCapacityProps {
   commissionPercent: number;
}



export const EventPricingCapacitySection = ({ commissionPercent }: EventPricingCapacityProps) => {
   const { register, watch, setValue, formState: { errors } } = useFormContext<EventFormValues>();
   
   const currentTicketType = watch("ticketType");
   const currentTicketPrice = watch("ticketPrice");

   const estimatedEarnings =
      currentTicketPrice && Number(currentTicketPrice) > 0
         ? (Number(currentTicketPrice) * (1 - commissionPercent / 100)).toFixed(2)
         : "0.00";

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
            <Tag className="w-5 h-5 text-(--brand-primary)" /> Pricing & Capacity
         </h3>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Card */}
            <div
               onClick={() => {
                  setValue("ticketType", "free");
                  setValue("ticketPrice", 0);
               }}
               className={cn(
                  "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:border-(--brand-primary-light)",
                  currentTicketType === "free"
                     ? "border-(--status-success) bg-(--status-success-bg)/10"
                     : "border-(--border-muted) bg-(--card-bg) hover:bg-(--bg-tertiary)"
               )}
            >
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div
                        className={cn(
                           "p-2 rounded-lg",
                           currentTicketType === "free" ? "bg-(--status-success) text-(--text-inverse)" : "bg-(--bg-tertiary) text-(--text-tertiary)"
                        )}
                     >
                        <Tag className="w-5 h-5" />
                     </div>
                     <div>
                        <p className={cn("font-semibold", currentTicketType === "free" ? "text-(--status-success)" : "text-(--text-primary)")}>
                           Free Event
                        </p>
                     </div>
                  </div>
                  {currentTicketType === "free" && <CheckCircle2 className="w-5 h-5 text-(--status-success)" />}
               </div>
            </div>

            {/* Paid Card */}
            <div
               onClick={() => setValue("ticketType", "paid")}
               className={cn(
                  "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:border-(--brand-primary-light)",
                  currentTicketType === "paid" ? "border-(--brand-primary) bg-(--badge-primary-bg)" : "border-(--border-muted) bg-(--card-bg) hover:bg-(--bg-tertiary)"
               )}
            >
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div
                        className={cn(
                           "p-2 rounded-lg",
                           currentTicketType === "paid" ? "bg-(--brand-primary) text-(--text-inverse)" : "bg-(--bg-tertiary) text-(--text-tertiary)"
                        )}
                     >
                        <IndianRupee className="w-5 h-5" />
                     </div>
                     <div>
                        <p className={cn("font-semibold", currentTicketType === "paid" ? "text-(--brand-primary)" : "text-(--text-primary)")}>
                           Paid Event
                        </p>
                     </div>
                  </div>
                  {currentTicketType === "paid" && <CheckCircle2 className="w-5 h-5 text-(--brand-primary)" />}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Ticket Price */}
            <div className={cn("transition-all duration-300", currentTicketType === "free" ? "opacity-75" : "opacity-100")}>
               <Label className="block mb-2 text-(--text-primary)">Ticket Price (₹)</Label>
               <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                     <span className="text-(--text-tertiary) font-semibold">₹</span>
                  </div>
                  <Input
                     type="number"
                     {...register("ticketPrice", { valueAsNumber: true })}
                     placeholder={currentTicketType === "free" ? "0.00" : "499.00"}
                     readOnly={currentTicketType === "free"}
                     min="0"
                     step="0.01"
                     className="pl-8 text-lg"
                  />
               </div>
               <FieldError message={errors.ticketPrice?.message} />

               {currentTicketType === "paid" && Number(currentTicketPrice || 0) > 0 && (
                  <div className="mt-2 text-xs text-(--text-secondary) flex flex-col gap-1 bg-(--bg-secondary) p-2 rounded-md">
                     <div className="flex justify-between">
                        <span>Platform Fee ({commissionPercent}%):</span>
                        <span className="text-(--status-error)">
                           - ₹{((Number(currentTicketPrice) * commissionPercent) / 100).toFixed(2)}
                        </span>
                     </div>
                     <div className="flex justify-between font-semibold border-t border-(--border-muted) pt-1 mt-1">
                        <span className="text-(--brand-primary)">Your Payout:</span>
                        <span className="text-(--status-success)">₹{estimatedEarnings}</span>
                     </div>
                  </div>
               )}
            </div>

            {/* Capacity */}
            <div>
               <Label className="block mb-2 text-(--text-primary)">Total Capacity *</Label>
               <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary)" />
                  <Input
                     type="number"
                     {...register("capacity", { valueAsNumber: true })}
                     placeholder="e.g. 100"
                     className="pl-9 text-lg"
                  />
               </div>
               <p className="text-xs text-(--text-tertiary) mt-1">Max number of attendees allowed.</p>
               <FieldError message={errors.capacity?.message} />
            </div>
         </div>
      </div>
   );
};