// frontend/src/components/user/user-events/UserEventActions.tsx
import { Eye, Edit, Rocket, Ban, ScanLine, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/shared/Tooltip";
import { useNavigate } from "react-router-dom";
import { type IEventState } from "@/types/event.types";
import { EVENT_FORMATS, EVENT_STATUSES } from "@/constants/event.constants";




interface EventActionsProps {
   event: IEventState;
   compact: boolean;
   onEdit: (event: IEventState) => void;
   onPublish: (eventId: string) => void;
   onCancel: (eventId: string) => void;
   onCheckIn: (event: IEventState) => void;
}



export function UserEventActions({
   event,
   compact,
   onEdit,
   onPublish,
   onCancel,
   onCheckIn,
}: EventActionsProps) {
   const navigate = useNavigate();
   const size = compact ? "h-8 w-8" : "";
   const iconSize = compact ? "h-4 w-4" : "h-4.5 w-4.5";

   return (
      <>
         <Tooltip content="View & Manage Event" side="top">
            <Button
               variant="ghost"
               size="icon"
               onClick={() => navigate(`/my-events/${event.eventId}`)}
               className={`${size} text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--bg-accent)`}
            >
               <Eye className={iconSize} />
            </Button>
         </Tooltip>

         {(event.eventStatus === EVENT_STATUSES.DRAFT || event.eventStatus === EVENT_STATUSES.UPCOMING || event.eventStatus === EVENT_STATUSES.ONGOING) && (
            <Tooltip content="Edit Event" side="top">
               <Button variant="ghost" size="icon" onClick={() => onEdit(event)} className={`${size} text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--bg-accent)`}>
                  <Edit className={iconSize} />
               </Button>
            </Tooltip>
         )}

         {event.eventStatus === EVENT_STATUSES.DRAFT && (
            <Tooltip content="Publish Event" side="top">
               <Button variant="ghost" size="icon" onClick={() => onPublish(event.eventId)} className={`${size} text-(--status-success) hover:bg-(--bg-accent)`}>
                  <Rocket className={iconSize} />
               </Button>
            </Tooltip>
         )}

         {!(["completed", "cancelled", "suspended"].includes(event.eventStatus)) && (
            <Tooltip content="Cancel Event" side="top">
               <Button variant="ghost" size="icon" onClick={() => onCancel(event.eventId)} className={`${size} text-(--status-error) hover:bg-(--bg-accent)`}>
                  <Ban className={iconSize} />
               </Button>
            </Tooltip>
         )}

         {(event.eventStatus === EVENT_STATUSES.UPCOMING || event.eventStatus === EVENT_STATUSES.ONGOING) && (
            event.format === EVENT_FORMATS.ONLINE ? (
               <Tooltip content="Enter Virtual Stage" side="top">
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={() => navigate(`/events/${event.eventId}/live`)} 
                     className={`${size} text-(--brand-primary) hover:bg-(--bg-accent)`}
                  >
                     <Video className={iconSize} />
                  </Button>
               </Tooltip>
            ) : (
               <Tooltip content="Gate Check-In" side="top">
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={() => onCheckIn(event)} 
                     className={`${size} text-(--status-success) hover:bg-(--bg-accent)`}
                  >
                     <ScanLine className={iconSize} />
                  </Button>
               </Tooltip>
            )
         )}
      </>
   );
}