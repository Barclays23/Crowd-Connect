// src/components/common/EventMap2.tsx
import { MapPin } from "lucide-react";

interface EventMap2Props {
  locationName?: string;
  className?: string;
}


function EventMap2({ locationName, className = "" }: EventMap2Props) {
  if (!locationName) return null;

  const mapEmbedUrl = locationName 
    ? `https://maps.google.com/maps?q=${encodeURIComponent(locationName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "";
    
  return (
    <div className={`rounded-xl border border-(--border-default) bg-(--card-bg) overflow-hidden shadow-(--shadow-xs) ${className}`}>
      <div className="bg-(--table-header-bg) px-6 py-4 border-b border-(--border-muted) flex items-center gap-2">
        <MapPin className="w-5 h-5 text-(--text-secondary)" />
        <h3 className="text-sm font-bold text-(--text-primary) uppercase tracking-wider">
          Event Location Map
        </h3>
      </div>

      <div className="w-full h-[300px] md:h-[400px] bg-(--bg-secondary)">
        <iframe
          title="Event Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapEmbedUrl}
          className="grayscale-[20%] contrast-125 dark:invert dark:hue-rotate-180 dark:opacity-80 transition-all"
        />
      </div>

      <div className="p-5 bg-(--card-bg) flex items-start gap-3">
        <MapPin className="w-5 h-5 text-(--brand-primary) shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-(--text-tertiary) uppercase tracking-widest mb-1">
            Destination Address
          </p>
          <p className="text-base font-semibold text-(--text-primary)">{locationName}</p>
        </div>
      </div>
    </div>
  );
}

export default EventMap2;