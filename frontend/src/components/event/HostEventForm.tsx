// src/components/event/HostEventForm.tsx
import React, { useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "react-toastify";

// UI components & utils
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ButtonLoader } from "@/components/shared/ButtonLoader";
import { type EventFormValues } from "@/schemas/event.schema";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { useGoogleMaps2 } from "@/contexts/GoogleMapsProvider2";
import { FieldError } from "../shared/FieldError";
import { generatePosterSchema } from "@/schemas/ai.schema";
import type { GeneratePosterPayload, GeneratePosterResponse } from "@/types/ai.types";
import { aiServices } from "@/services/aiServices";
import type { ApiResponse } from "@/types/common.types";

// Extracted UI Sections
import { Checkbox } from "@/components/ui/checkbox";
import { TermsModal } from "@/components/shared/TermsModal";
import { EventBannerImageSection } from "@/components/event/EventBannerImageSection";
import { EventPricingCapacitySection } from "@/components/event/EventPricingCapacitySection";
import { EventFormatLocationSection } from "@/components/event/EventFormatLocationSection";
import { EventDateTimeSection } from "@/components/event/EventDateTimeSection";
import { EventMapPicker } from "@/components/event/EventMapPicker";
import { EventBasicDetailsSection } from "@/components/event/EventBasicDetailsSection";


// Props for reusable form
interface EventFormProps {
   isEditMode?: boolean;
   onCancel?: () => void;
   onSubmit: (data: EventFormValues) => Promise<void>;
   existingImageUrl?: string;
   commissionPercent?: number;
}

export const HostEventForm = ({
  isEditMode = false,
  onCancel,
  onSubmit,
  existingImageUrl,
  commissionPercent = 10,
}: EventFormProps) => {
   const {
      handleSubmit,
      getValues,
      setValue,
      watch,
      trigger,
      control,
      formState: { errors, isSubmitting },
   } = useFormContext<EventFormValues>();

   const currentUseAI = watch("useAI");
   const currentAiImage = watch("aiGeneratedImage");
   const currentUploadedImage = watch("uploadedImage");
   const selectedCords = watch("locationCoordinates");
   const selectedPlace = watch("locationName");

   const [isGeneratingAI, setIsGeneratingAI] = useState(false);
   const [showMapModal, setShowMapModal] = useState(false);
   const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
   
   // Default center (Kerala)
   const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
      selectedCords || { lat: 10.8505, lng: 76.2711 }
   );
   const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
      selectedCords || null
   );
   const [showTermsModal, setShowTermsModal] = useState(false);

   const uploadedPreviewUrl = currentUploadedImage ? URL.createObjectURL(currentUploadedImage) : null;
   const activePreview = currentAiImage || uploadedPreviewUrl || existingImageUrl || null;

   const { isLoaded } = useGoogleMaps2();

   // 1. SYNC FROM AUTOCOMPLETE TO MAP
   const handlePlaceSelected = React.useCallback(
      ({ name, lat, lng }: { name: string; lat: number; lng: number; formattedAddress?: string }) => {
         const safeLat = Number(lat);
         const safeLng = Number(lng);

         if (isNaN(safeLat) || isNaN(safeLng)) {
            toast.warn("Invalid location coordinates – please try again");
            return;
         }

         const coords = { lat: safeLat, lng: safeLng };

         setValue("locationName", name, { shouldValidate: true });
         setValue("locationCoordinates", coords, { shouldValidate: true });

         // Update Map state
         setMapCenter(coords);
         setSelectedPosition(coords);

         trigger(["locationName", "locationCoordinates"]);
      },
      [setValue, trigger]
   );

   // 2. OPEN MAP MODAL WITH SYNCED COORDINATES
   const handleOpenMapModal = () => {
      if (selectedCords) {
         setMapCenter(selectedCords);
         setSelectedPosition(selectedCords);
      }
      setShowMapModal(true);
   };

   // 3. SYNC FROM MAP TO FORM (WITH CLEANED ADDRESS & NO PLUS CODES)
   const confirmMapSelection = () => {
      if (!selectedPosition) return;

      // 1. If user clicked a specific Business/POI, fetch its exact name
      if (selectedPlaceId && window.google?.maps?.places?.PlacesService) {
         const mapDiv = document.createElement('div');
         const service = new window.google.maps.places.PlacesService(mapDiv);
         
         service.getDetails({ placeId: selectedPlaceId, fields: ['name', 'formatted_address'] }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.name) {
               setValue("locationName", place.name, { shouldValidate: true });
               setValue("locationCoordinates", selectedPosition, { shouldValidate: true });
               setMapCenter(selectedPosition);
               setShowMapModal(false);
               trigger(["locationName", "locationCoordinates"]);
               toast.success("Pinned Location: " + place.name);
            } else {
               // Fallback if Place details fail
               fallbackReverseGeocode(selectedPosition); 
            }
         });
      } 
      // 2. If user just dropped a pin on a random street, get the street address
      else {
         fallbackReverseGeocode(selectedPosition);
      }
   };

   // Helper function for standard reverse-geocoding (accepts strictly typed 'pos')
   const fallbackReverseGeocode = (pos: { lat: number; lng: number }) => {
      if (window.google?.maps?.Geocoder) {
         const geocoder = new window.google.maps.Geocoder();
         geocoder.geocode({ location: pos }, (results, status) => {
            let placeName = `Pinned Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`;

            if (status === "OK" && results && results.length > 0) {
               const preferredResult = results.find(r => !r.types.includes("plus_code")) || results[0];
               placeName = preferredResult.formatted_address.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,4},\s*/i, "");
            }

            setValue("locationName", placeName, { shouldValidate: true });
            setValue("locationCoordinates", pos, { shouldValidate: true });
            setMapCenter(pos);
            setShowMapModal(false);
            trigger(["locationName", "locationCoordinates"]);
            toast.success("Location pinned: " + placeName);
         });
      } else {
         // Ultimate failsafe if Google Maps fails to load
         setValue("locationName", `Pinned Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`, { shouldValidate: true });
         setValue("locationCoordinates", pos, { shouldValidate: true });
         setMapCenter(pos);
         setShowMapModal(false);
         trigger(["locationName", "locationCoordinates"]);
         // toast.success("Location pinned!");
         toast.success(`Pinned Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
      }
   };

   const mapOptions = useMemo(() => ({
      disableDefaultUI: true,
      zoomControl: true,
   }), []);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file) {
         setValue("uploadedImage", file);
         setValue("aiGeneratedImage", null);
         trigger();
      }
   };

   const handleToggleAI = () => {
      setValue("useAI", !currentUseAI);
      setValue("uploadedImage", null);
      setValue("aiGeneratedImage", null);
   };

   const handleGenerateAiPoster = async () => {
      const currentValues = getValues();
      const validation = generatePosterSchema.safeParse(currentValues);

      if (!validation.success) {
         trigger(["title", "category", "description", "startDate", "startTime"]);
         toast.error("Please fill title, category, description, and start date/time first.");
         return;
      }

      try {
         setIsGeneratingAI(true);

         const payload: GeneratePosterPayload = {
            title: currentValues.title,
            category: currentValues.category,
            description: currentValues.description,
            startDateTime: new Date(`${currentValues.startDate}T${currentValues.startTime}:00`).toISOString(),
            locationName: currentValues.locationName || (currentValues.format === "online" ? "Virtual Event" : ""),
         };

         const response: ApiResponse<GeneratePosterResponse> = await aiServices.generateEventPoster(payload);

         if (response.data.base64Data) {
            setValue("aiGeneratedImage", response.data.base64Data, { shouldValidate: true, shouldDirty: true });
            setValue("uploadedImage", null);
            toast.success(response.message);
         }
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setIsGeneratingAI(false);
      }
   };

   return (
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         {/* 1. BASIC DETAILS */}
         <EventBasicDetailsSection />

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 2. DATE & TIME */}
         <EventDateTimeSection />

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 3. EVENT FORMAT & LOCATION */}
         <EventFormatLocationSection 
            isLoaded={isLoaded}
            handlePlaceSelected={handlePlaceSelected}
            handleOpenMapModal={handleOpenMapModal}
            selectedPlace={selectedPlace}
            selectedCords={selectedCords}
         />

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 4. PRICING & CAPACITY */}
         <EventPricingCapacitySection commissionPercent={commissionPercent} />

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 5. BANNER & AI */}
         <EventBannerImageSection 
            isGeneratingAI={isGeneratingAI}
            handleToggleAI={handleToggleAI}
            handleGenerateAiPoster={handleGenerateAiPoster}
            handleFileChange={handleFileChange}
            activePreview={activePreview}
         />

         {/* 6. HOST TERMS & CONDITIONS */}
         <div className="space-y-2">
            <div className="flex items-start space-x-3 pt-2">
               <Controller
                  name="agreeTerms"
                  control={control}
                  render={({ field }) => (
                     <Checkbox
                        id="hostAgreeTerms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border-(--border-muted) data-[state=checked]:bg-(--brand-primary) data-[state=checked]:border-(--brand-primary)"
                     />
                  )}
               />
               <Label htmlFor="hostAgreeTerms" className="text-sm text-(--text-secondary) leading-relaxed cursor-pointer font-normal">
                  I agree to the platform's
                  <span
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                     className="text-(--brand-primary) hover:underline ml-1 font-medium"
                  >
                     Host Guidelines & Terms of Service
                  </span>
                  , confirming that the details provided are accurate and I hold all necessary rights for this event.
               </Label>
            </div>
            <FieldError message={errors.agreeTerms?.message} />
         </div>

         {/* Submit / Cancel buttons */}
         <div className="flex justify-end gap-4 pt-6">
            {onCancel && (
               <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
               </Button>
            )}
            <Button type="submit" variant="default" disabled={isSubmitting || isGeneratingAI}>
               <ButtonLoader loading={isSubmitting || isGeneratingAI} loadingText={isEditMode ? "Saving..." : "Creating..."}>
                  {isEditMode ? "Save Changes" : "Create Event"}
               </ButtonLoader>
            </Button>
         </div>

         {/* MAP PICKER MODAL WITH AUTO-ZOOM */}
         <EventMapPicker 
            showMapModal={showMapModal}
            setShowMapModal={setShowMapModal}
            mapCenter={mapCenter}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            setSelectedPlaceId={setSelectedPlaceId}
            confirmMapSelection={confirmMapSelection}
            mapOptions={mapOptions}
         />

         {/* TermsModal */}
         <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            termTypes={["hostTerms"]}
            title="Host Guidelines & Terms of Service"
         />
      </form>
   );
};