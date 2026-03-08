// src/components/common/EventMap.tsx
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { ExternalLink, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";


const defaultIcon = new Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


function MapErrorHandler({ onError }: { onError: () => void }) {
  useMapEvent('error', onError);
  return null;
}


function ZoomControls() {
  const map = useMap();
  
  return (
    <div className="absolute top-2 right-2 z-400 flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="p-1.5 rounded-t-lg border transition-colors"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          e.currentTarget.style.color = "var(--brand-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--card-bg)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
        aria-label="Zoom in"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="p-1.5 rounded-b-lg border transition-colors"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          e.currentTarget.style.color = "var(--brand-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--card-bg)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
        aria-label="Zoom out"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}



interface EventMapProps {
  lat: number;
  lng: number;
  locationName?: string;
  venue?: string;
  interactive?: boolean;
  height?: string | number;
  showExternalLink?: boolean;
}

// USAGE IN OTHER COMPONENTS

// For event details page (interactive)
{/* <EventMap 
  lat={10.5276} 
  lng={76.2144} 
  locationName="Thrissur, Kerala"
  venue="Conference Hall"
  interactive={true}
  height={350}
/> */}

// For event cards (non-interactive preview)
{/* <EventMap 
  lat={10.5276} 
  lng={76.2144} 
  locationName="Thrissur, Kerala"
  interactive={false}
  height={180}
  showExternalLink={false}
/> */}

export function EventMap({ 
   lat, 
   lng, 
   locationName, 
   venue,
   interactive = true,
   height = 280,
   showExternalLink = true
}: EventMapProps) {
   const [mapError, setMapError] = useState(false);
   const [mapKey, setMapKey] = useState(`${lat}-${lng}`);
   
   // Fallback URL for external map
   const externalMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
   
   // Update map key when coordinates change
   useEffect(() => {
      setMapKey(`${lat}-${lng}`);
      setMapError(false); // Reset error state when coordinates change
   }, [lat, lng]);
   
   // Validate coordinates
   if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return (
         <div 
         className="flex items-center justify-center rounded-lg border"
         style={{ 
            height, 
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-default)",
         }}
         >
         <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Location not available
         </p>
         </div>
      );
   }

   if (mapError) {
      return (
         <div className="space-y-2">
         <div 
            className="flex items-center justify-center rounded-lg border"
            style={{ 
               height, 
               backgroundColor: "var(--bg-secondary)",
               borderColor: "var(--border-default)",
            }}
         >
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
               Map failed to load
            </p>
         </div>
         {showExternalLink && (
            <a
               href={externalMapUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 text-sm transition-colors"
               style={{ color: "var(--brand-primary)" }}
               onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary-hover)")}
               onMouseLeave={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
            >
               <ExternalLink size={14} />
               Open in OpenStreetMap
            </a>
         )}
         </div>
      );
   }

   return (
      <div className="space-y-2">
         <div 
         className="relative w-full overflow-hidden rounded-lg border shadow-sm"
         style={{ 
            height, 
            borderColor: "var(--border-default)",
         }}
         >
         <MapContainer
            key={mapKey}
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={interactive}
            dragging={interactive}
            touchZoom={interactive}
            doubleClickZoom={interactive}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
         >
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Error handler component */}
            <MapErrorHandler onError={() => setMapError(true)} />
            
            {interactive && <ZoomControls />}
            
            <Marker position={[lat, lng]} icon={defaultIcon}>
               {(locationName || venue) && (
               <Popup>
                  <div className="text-sm">
                     {venue && (
                     <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {venue}
                     </div>
                     )}
                     {locationName && (
                     <div style={{ color: "var(--text-secondary)" }}>
                        {locationName}
                     </div>
                     )}
                  </div>
               </Popup>
               )}
            </Marker>
         </MapContainer>
         </div>

         {showExternalLink && (
         <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 text-sm transition-colors"
            style={{ color: "var(--brand-primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
         >
            <ExternalLink size={14} />
            Open in OpenStreetMap
         </a>
         )}
      </div>
   );
}