// src/components/event/EventMapPicker.tsx
import { GoogleMap, Marker } from "@react-google-maps/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const modalMapStyle = { width: "100%", height: "400px" };

interface EventMapPickerProps {
   showMapModal: boolean;
   setShowMapModal: (show: boolean) => void;
   mapCenter: { lat: number; lng: number };
   selectedPosition: { lat: number; lng: number } | null;
   setSelectedPosition: (pos: { lat: number; lng: number }) => void;
   setSelectedPlaceId: (id: string | null) => void;
   confirmMapSelection: () => void;
   mapOptions: any;
}

export const EventMapPicker = ({
   showMapModal,
   setShowMapModal,
   mapCenter,
   selectedPosition,
   setSelectedPosition,
   setSelectedPlaceId,
   confirmMapSelection,
   mapOptions,
}: EventMapPickerProps) => {
   if (!showMapModal) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-sm p-4">
         <div className="bg-(--bg-primary) p-5 rounded-2xl w-full max-w-2xl border border-(--border-focus) shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-semibold text-(--heading-primary)">Select Location</h3>
               <Button variant="ghost" size="icon" onClick={() => setShowMapModal(false)}>
                  <X className="w-5 h-5 text-(--text-secondary)" />
               </Button>
            </div>
            
            <div className="rounded-xl overflow-hidden border border-(--border-muted)">
               <GoogleMap 
                  mapContainerStyle={modalMapStyle}
                  center={mapCenter}
                  zoom={selectedPosition ? 16 : 8} // AUTO-ZOOM IN IF POSITION EXISTS
                  options={mapOptions}
                  onClick={(e: google.maps.MapMouseEvent) => {
                     if (e.latLng) {
                        setSelectedPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });

                        // Check if the user clicked a specific POI/Icon
                        const iconEvent = e as google.maps.IconMouseEvent;
                        if (iconEvent.placeId) {
                           setSelectedPlaceId(iconEvent.placeId);
                           if (typeof iconEvent.stop === 'function') {
                              iconEvent.stop();
                           }
                        } else {
                           setSelectedPlaceId(null);
                        }
                     }
                  }}
               >
                  {selectedPosition && <Marker position={selectedPosition} />}
               </GoogleMap>
            </div>

            <div className="flex justify-end gap-3 mt-2">
               <Button type="button" variant="outline" onClick={() => setShowMapModal(false)}>
                  Cancel
               </Button>
               <Button type="button" onClick={confirmMapSelection} disabled={!selectedPosition}>
                  Confirm Location
               </Button>
            </div>
         </div>
      </div>
   );
};
