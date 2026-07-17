// frontend/src/components/event/OrganiserEventCard.tsx
import { CalendarDays, Star, Tag } from "lucide-react";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import type { OrganiserEventsData } from "@/types/event.types";
import { EVENT_STATUSES } from "@/constants/event.constants";


interface OrganiserEventCardProps {
    event: OrganiserEventsData;
    onClick: () => void;
}



export default function OrganiserEventCard({ event, onClick }: OrganiserEventCardProps) {
    const isCompleted = event.eventStatus === EVENT_STATUSES.COMPLETED || new Date(event.startDateTime) < new Date();

    return (
        <div 
            onClick={onClick}
            className="group flex gap-4 p-3 bg-(--card-bg) border border-(--card-border) rounded-2xl cursor-pointer hover:shadow-md hover:border-(--brand-primary) transition-all duration-200"
        >
            {/* Thumbnail */}
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-(--bg-secondary) relative">
                {event.posterUrl ? (
                    <img 
                        src={event.posterUrl} 
                        alt={event.title} 
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isCompleted ? 'grayscale opacity-80' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-(--text-tertiary)">
                        <CalendarDays size={24} className="opacity-40" />
                    </div>
                )}
                {/* Format Badge overlay */}
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                    {event.format}
                </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                <div className="flex items-center gap-1.5 text-[10px] text-(--text-tertiary) font-semibold uppercase tracking-wider mb-1">
                    <Tag size={10} className="text-(--brand-primary)" />
                    <span className="truncate">{event.category}</span>
                </div>
                
                <h3 className="text-sm font-bold text-(--heading-primary) line-clamp-2 leading-snug group-hover:text-(--brand-primary) transition-colors">
                    {event.title}
                </h3>
                
                <p className="text-xs text-(--text-secondary) mt-1.5 mb-2">
                    {formatDate2(event.startDateTime)}
                </p>

                {/* Rating display or No Rating state */}
                {event.ratingAverage > 0 ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 w-fit px-2 py-0.5 rounded-full border border-amber-100">
                        <Star size={12} fill="currentColor" />
                        {event.ratingAverage} 
                        <span className="text-(--text-tertiary) font-medium ml-0.5">({event.totalReviews})</span>
                    </div>
                ) : (
                    <span className="text-[10px] text-(--text-tertiary) bg-(--bg-secondary) px-2 py-1 rounded-md w-fit">
                        {isCompleted ? "No reviews yet" : "Upcoming Event"}
                    </span>
                )}
            </div>
        </div>
    );
}