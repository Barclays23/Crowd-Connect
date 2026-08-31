// src/components/event/EventFormatLocationSection.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { MapPin, Building2, Globe, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FieldError } from "../shared/FieldError";
import { GooglePlacesAutoComplete } from "@/components/shared/GooglePlacesAutoComplete";
import { type EventFormValues } from "@/schemas/event.schema";
import { EVENT_FORMATS } from "@/constants/event.constants";



interface EventFormatLocationProps {
   isLoaded: boolean;
   handlePlaceSelected: (data: any) => void;
   handleOpenMapModal: () => void;
   selectedPlace?: string | null;
   selectedCords?: { lat: number; lng: number } | null;
}




export const EventFormatLocationSection = ({
   isLoaded,
   handlePlaceSelected,
   handleOpenMapModal,
   selectedPlace,
   selectedCords
}: EventFormatLocationProps) => {
   const { watch, setValue, formState: { errors } } = useFormContext<EventFormValues>();
   const currentFormat = watch("format");

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
            <MapPin className="w-5 h-5 text-(--brand-primary)" /> Event Format & Location
         </h3>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Venue Card */}
            <div
               onClick={() => setValue("format", EVENT_FORMATS.OFFLINE, { shouldValidate: true })}
               className={cn(
                  "cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200",
                  currentFormat === EVENT_FORMATS.OFFLINE
                     ? "border-(--brand-primary) bg-(--badge-primary-bg) text-(--brand-primary)"
                     : "border-(--border-muted) bg-(--card-bg) text-(--text-secondary) hover:border-(--brand-primary-light) hover:bg-(--bg-tertiary)"
               )}
            >
               <div
                  className={cn(
                     "p-3 rounded-full flex items-center justify-center transition-colors",
                     currentFormat === EVENT_FORMATS.OFFLINE
                        ? "bg-(--brand-primary) text-(--text-inverse)"
                        : "bg-(--bg-tertiary) text-(--text-tertiary)"
                  )}
               >
                  <Building2 className="w-5 h-5" />
               </div>
               <div>
                  <p className={cn("font-semibold text-sm", currentFormat === EVENT_FORMATS.OFFLINE ? "text-(--brand-primary)" : "text-(--text-primary)")}>
                     Venue
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">Attendees meet at a physical location</p>
               </div>
               {currentFormat === EVENT_FORMATS.OFFLINE && (
                  <div className="ml-auto">
                     <CheckCircle2 className="w-5 h-5 text-(--brand-primary)" />
                  </div>
               )}
            </div>

            {/* Online Card */}
            <div
               onClick={() => {
                  setValue("format", EVENT_FORMATS.ONLINE, { shouldValidate: true });
                  setValue("locationName", "");
                  setValue("locationCoordinates", undefined);
               }}
               className={cn(
                  "cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200",
                  currentFormat === EVENT_FORMATS.ONLINE
                     ? "border-(--brand-primary) bg-(--badge-primary-bg) text-(--brand-primary)"
                     : "border-(--border-muted) bg-(--card-bg) text-(--text-secondary) hover:border-(--brand-primary-light) hover:bg-(--bg-tertiary)"
               )}
            >
               <div
                  className={cn(
                     "p-3 rounded-full flex items-center justify-center transition-colors",
                     currentFormat === EVENT_FORMATS.ONLINE
                        ? "bg-(--brand-primary) text-(--text-inverse)"
                        : "bg-(--bg-tertiary) text-(--text-tertiary)"
                  )}
               >
                  <Globe className="w-5 h-5" />
               </div>
               <div>
                  <p className={cn("font-semibold text-sm", currentFormat === EVENT_FORMATS.ONLINE ? "text-(--brand-primary)" : "text-(--text-primary)")}>
                     Online
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">Livestream, Webinar, or Virtual</p>
                  <p className="text-xs opacity-80 mt-0.5">Hosted natively on your built-in Live Stage</p>
               </div>
               {currentFormat === EVENT_FORMATS.ONLINE && (
                  <div className="ml-auto">
                     <CheckCircle2 className="w-5 h-5 text-(--brand-primary)" />
                  </div>
               )}
            </div>
         </div>

         {currentFormat === EVENT_FORMATS.OFFLINE && (
            <div className="relative z-20">
               <Label className="block mb-2 text-(--text-primary)">Venue / City *</Label>

               {/* Venue Input & Map Picker Button */}
               <div className="flex gap-2 items-start">
                  <div className="flex-1">
                     {isLoaded ? (
                        // OPTION-1: GOOGLE PLACE AUTO COMPLETE (CUSTOM UI)
                        <GooglePlacesAutoComplete
                           // key={selectedCords?.lat || "new-location"}
                           // defaultValue={watch("locationName") || ""}
                           defaultValue={selectedPlace || ""}
                           onPlaceSelected={handlePlaceSelected}
                           placeholder="Search venue, city or address..."
                           className="w-full"
                        />
                        // OPTION-2: GOOGLE PLACE AUTO COMPLETE (WIDGET)
                        // <GooglePlacesWidgetAutoComplete
                        //    onPlaceSelected={handlePlaceSelected}
                        //    placeholder="Search venue, city or address in Kerala..."
                        //    className="w-full"
                        // />
                     ) : (
                        <Input placeholder="Loading map services..." disabled />
                     )}
                  </div>
                  
                  <Button 
                     type="button" 
                     variant="secondary" 
                     onClick={handleOpenMapModal}
                     className="shrink-0 h-10"
                     disabled={!isLoaded}
                  >
                     <MapPin className="w-4 h-4 mr-2 text-(--brand-primary)" />
                     Pick on Map
                  </Button>
               </div>

               {selectedPlace && selectedCords && (
                  <div className="mt-1.5 text-sm text-gray-600 italic">
                     {selectedPlace}
                  </div>
               )}
               {selectedCords && (
                  <div className="mt-2 text-xs flex items-center gap-1.5 text-green-600">
                     <CheckCircle2 className="w-4 h-4" />
                     Location selected
                  </div>
               )}

               <FieldError message={errors.locationName?.message} />
               <FieldError message={errors.locationCoordinates?.message} />
            </div>
         )}
      </div>
   );
};