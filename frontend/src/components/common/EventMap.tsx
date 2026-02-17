// src/components/EventMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png"; // or your custom icon



interface EventMapProps {
  lat: number;
  lng: number;
  name?: string;
}

const defaultIcon = new Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});



export function EventMap({ lat, lng, name }: EventMapProps) {
   return (
      <div className="h-64 w-full overflow-hidden rounded-lg border border-(--border-muted) shadow-sm">
         <MapContainer
            center={[lat, lng]}
            // zoom={15}  // maximum 20
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
         >
         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />
         <Marker position={[lat, lng]} icon={defaultIcon}>
            {name && <Popup>{name}</Popup>}
         </Marker>
         </MapContainer>
      </div>
   );
}