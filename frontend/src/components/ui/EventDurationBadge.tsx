// frontend/src/components/ui/EventDurationBadge.tsx
import { useMemo } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateEventDuration } from "@/utils/dateAndTimeFormats";

interface EventDurationBadgeProps {
   startDateTime: string | Date | null | undefined;
   endDateTime: string | Date | null | undefined;
   className?: string;
}

export const EventDurationBadge = ({ 
   startDateTime, 
   endDateTime, 
   className 
}: EventDurationBadgeProps) => {
  
   const durationInfo = useMemo(() => {
      if (!startDateTime || !endDateTime) return null;
      return calculateEventDuration(startDateTime, endDateTime);
   }, [startDateTime, endDateTime]);

   if (!durationInfo) return null;

   return (
      <div 
         className={cn(
         "flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-lg border animate-in fade-in slide-in-from-top-2",
         durationInfo.isValid 
            ? "bg-green-400/10 border-green-400/30 text-green-400" 
            : "bg-(--brand-primary)/10 border-(--brand-primary)/20 text-(--brand-primary)",
         className // Allows you to pass specific margins/layouts from the parent
         )}
      >
         <Timer className="w-4.5 h-4.5" />
         <span className="text-sm font-medium">
            Total Duration: {durationInfo.text}
         </span>
      </div>
   );
};


// Using it on other pages like
{/* <EventDurationBadge 
   startDateTime={event.startDateTime} 
   endDateTime={event.endDateTime} 
/> */}