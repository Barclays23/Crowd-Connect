// src/components/host/HostEventForm.tsx

import React, { useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Calendar, Clock, MapPin, Users, Upload, Globe, Building2,
  FileText, Tag, Sparkles, Bot, CheckCircle2,
  Loader2, IndianRupee,
  X,
} from "lucide-react";
import { GoogleMap, Marker } from "@react-google-maps/api";


// UI components & utils
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TextArea } from "@/components/ui/text-area";
import { ButtonLoader } from "@/components/common/ButtonLoader";
import { type EventFormValues } from "@/schemas/event.schema";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { useGoogleMaps2 } from "@/contexts/GoogleMapsProvider2";
import { FieldError } from "../ui/FieldError";
import { setupGooglePlaceAutocompleteWidget } from "@/utils/google-map-utils/google-place-autocomplete-widget";
import { GooglePlacesAutoComplete } from "@/components/common/GooglePlacesAutoComplete";
import { GooglePlacesWidgetAutoComplete } from "@/components/common/GooglePlacesWidgetAutoComplete";
import { EventDurationBadge } from "@/components/ui/EventDurationBadge";
import { EVENT_CATEGORIES } from "@/constants/event.constants";
import { generatePosterSchema } from "@/schemas/ai.schema";
import type { GeneratePosterData, GeneratePosterPayload } from "@/types/ai.types";
import { aiServices } from "@/services/aiServices";
import type { ApiResponse } from "@/types/common.types";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsModal } from "@/components/common/TermsModal";


const mapContainerStyle = { width: "100%", height: "200px" };
const modalMapStyle = { width: "100%", height: "400px" };


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
      register,
      handleSubmit,
      getValues,
      setValue,
      watch,
      trigger,
      control,
      formState: { errors, isSubmitting },
   } = useFormContext<EventFormValues>();

   // Form watchers
   const currentTitle = watch("title");
   const currentCategory = watch("category");
   const currentFormat = watch("format");
   const watchedStartDate = watch("startDate");
   const watchedStartTime = watch("startTime");
   const watchedEndDate = watch("endDate");
   const watchedEndTime = watch("endTime");
   const currentTicketType = watch("ticketType");
   const currentTicketPrice = watch("ticketPrice");
   const currentUseAI = watch("useAI");
   const currentAiImage = watch("aiGeneratedImage");
   const currentUploadedImage = watch("uploadedImage");
   const selectedCords = watch("locationCoordinates");
   const selectedPlace = watch("locationName");

   const startStr = watchedStartDate && watchedStartTime ? `${watchedStartDate}T${watchedStartTime}:00` : null;
   const endStr = watchedEndDate && watchedEndTime ? `${watchedEndDate}T${watchedEndTime}:00` : null;

   const startDateRef = useRef<HTMLInputElement>(null);
   const startTimeRef = useRef<HTMLInputElement>(null);
   const endDateRef = useRef<HTMLInputElement>(null);
   const endTimeRef = useRef<HTMLInputElement>(null);

   const { ref: startDateHookRef, ...startDateRest } = register("startDate");
   const { ref: startTimeHookRef, ...startTimeRest } = register("startTime");
   const { ref: endDateHookRef, ...endDateRest } = register("endDate");
   const { ref: endTimeHookRef, ...endTimeRest } = register("endTime");

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

   const estimatedEarnings =
      currentTicketPrice && Number(currentTicketPrice) > 0
         ? (Number(currentTicketPrice) * (1 - commissionPercent / 100)).toFixed(2)
         : "0.00";

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
               toast.success("Location pinned!");
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
            toast.success("Location pinned!");
         });
      } else {
         // Ultimate failsafe if Google Maps fails to load
         setValue("locationName", `Pinned Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`, { shouldValidate: true });
         setValue("locationCoordinates", pos, { shouldValidate: true });
         setMapCenter(pos);
         setShowMapModal(false);
         trigger(["locationName", "locationCoordinates"]);
         toast.success("Location pinned!");
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

         const response: ApiResponse<GeneratePosterData> = await aiServices.generateEventPoster(payload);

         if (response.data.aiPosterData) {
            setValue("aiGeneratedImage", response.data.aiPosterData, { shouldValidate: true, shouldDirty: true });
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
         <div className="space-y-4">
            <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
               <FileText className="w-5 h-5 text-(--brand-primary)" /> Basic Details
            </h3>

            <div>
               <Label className="block mb-2 text-(--text-primary)">Event Title *</Label>
               <Input {...register("title")} placeholder="e.g. The Future of Tech 2026" />
               <FieldError message={errors.title?.message} />
            </div>

            <div>
               <Label className="block mb-2 text-(--text-primary)">Category *</Label>
               <Select
                  value={currentCategory ?? ""}
                  onValueChange={(val) =>
                     setValue("category", val as typeof EVENT_CATEGORIES[number], { shouldValidate: true, shouldDirty: true })
                  }
               >
                  <SelectTrigger>
                     <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                     {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                           {cat}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
               <FieldError message={errors.category?.message} />
            </div>

            <div>
               <Label className="block mb-2 text-(--text-primary)">Description *</Label>
               <TextArea {...register("description")} rows={4} placeholder="Describe your event..." />
               <FieldError message={errors.description?.message} />
            </div>
         </div>

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 2. DATE & TIME */}
         <div className="space-y-4">
            <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
               <Calendar className="w-5 h-5 text-(--brand-primary)" /> Date & Time
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-3">
                  <Label className="text-xs font-bold text-(--text-secondary) uppercase">Starts</Label>
                  <div className="relative">
                     <Input
                        type="date"
                        {...startDateRest}
                        ref={(e) => {
                           startDateHookRef(e);
                           startDateRef.current = e;
                        }}
                        className="pr-10"
                     />
                     <Calendar
                        onClick={() => startDateRef.current?.showPicker()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                     />
                  </div>
                  <div className="relative">
                     <Input
                        type="time"
                        {...startTimeRest}
                        ref={(e) => {
                           startTimeHookRef(e);
                           startTimeRef.current = e;
                        }}
                        className="pr-10"
                     />
                     <Clock
                        onClick={() => startTimeRef.current?.showPicker()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                     />
                  </div>
                  <FieldError message={errors.startDate?.message} />
                  <FieldError message={errors.startTime?.message} />
               </div>

               <div className="space-y-3">
                  <Label className="text-xs font-bold text-(--text-secondary) uppercase">Ends</Label>
                  <div className="relative">
                     <Input
                        type="date"
                        {...endDateRest}
                        ref={(e) => {
                           endDateHookRef(e);
                           endDateRef.current = e;
                        }}
                        className="pr-10"
                     />
                     <Calendar
                        onClick={() => endDateRef.current?.showPicker()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                     />
                  </div>
                  <div className="relative">
                     <Input
                        type="time"
                        {...endTimeRest}
                        ref={(e) => {
                           endTimeHookRef(e);
                           endTimeRef.current = e;
                        }}
                        className="pr-10"
                     />
                     <Clock
                        onClick={() => endTimeRef.current?.showPicker()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) cursor-pointer"
                     />
                  </div>
                  <FieldError message={errors.endDate?.message} />
                  <FieldError message={errors.endTime?.message} />
               </div>
            </div>

            <EventDurationBadge startDateTime={startStr} endDateTime={endStr} className="mt-2" />
         </div>

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 3. EVENT FORMAT & LOCATION */}
         <div className="space-y-4">
            <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
               <MapPin className="w-5 h-5 text-(--brand-primary)" /> Event Format & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Venue Card */}
               <div
                  onClick={() => setValue("format", "offline", { shouldValidate: true })}
                  className={cn(
                     "cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200",
                     currentFormat === "offline"
                        ? "border-(--brand-primary) bg-(--badge-primary-bg) text-(--brand-primary)"
                        : "border-(--border-muted) bg-(--card-bg) text-(--text-secondary) hover:border-(--brand-primary-light) hover:bg-(--bg-tertiary)"
                  )}
               >
                  <div
                     className={cn(
                        "p-3 rounded-full flex items-center justify-center transition-colors",
                        currentFormat === "offline"
                           ? "bg-(--brand-primary) text-(--text-inverse)"
                           : "bg-(--bg-tertiary) text-(--text-tertiary)"
                     )}
                  >
                     <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                     <p className={cn("font-semibold text-sm", currentFormat === "offline" ? "text-(--brand-primary)" : "text-(--text-primary)")}>
                        Venue
                     </p>
                     <p className="text-xs opacity-80 mt-0.5">Attendees meet at a physical location</p>
                  </div>
                  {currentFormat === "offline" && (
                     <div className="ml-auto">
                        <CheckCircle2 className="w-5 h-5 text-(--brand-primary)" />
                     </div>
                  )}
               </div>

               {/* Online Card */}
               <div
                  onClick={() => {
                     setValue("format", "online", { shouldValidate: true });
                     setValue("locationName", "");
                     setValue("locationCoordinates", undefined);
                  }}
                  className={cn(
                     "cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200",
                     currentFormat === "online"
                        ? "border-(--brand-primary) bg-(--badge-primary-bg) text-(--brand-primary)"
                        : "border-(--border-muted) bg-(--card-bg) text-(--text-secondary) hover:border-(--brand-primary-light) hover:bg-(--bg-tertiary)"
                  )}
               >
                  <div
                     className={cn(
                        "p-3 rounded-full flex items-center justify-center transition-colors",
                        currentFormat === "online"
                           ? "bg-(--brand-primary) text-(--text-inverse)"
                           : "bg-(--bg-tertiary) text-(--text-tertiary)"
                     )}
                  >
                     <Globe className="w-5 h-5" />
                  </div>
                  <div>
                     <p className={cn("font-semibold text-sm", currentFormat === "online" ? "text-(--brand-primary)" : "text-(--text-primary)")}>
                        Online
                     </p>
                     <p className="text-xs opacity-80 mt-0.5">Livestream, Webinar, or Virtual</p>
                  </div>
                  {currentFormat === "online" && (
                     <div className="ml-auto">
                        <CheckCircle2 className="w-5 h-5 text-(--brand-primary)" />
                     </div>
                  )}
               </div>
            </div>

            {currentFormat === "offline" && (
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

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 4. PRICING & CAPACITY */}
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

         <div className="h-px bg-(--border-muted) my-6" />

         {/* 5. BANNER & AI */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-(--brand-primary)" /> Event Banner
               </h3>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-(--text-secondary)">Enable AI</span>
                  <div
                     onClick={handleToggleAI}
                     className={cn(
                        "w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                        currentUseAI ? "bg-(--brand-primary)" : "bg-(--bg-tertiary) border border-(--border-brand)"
                     )}
                  >
                     <div className={cn("absolute top-1 left-1 w-4 h-4 bg-(--text-inverse) rounded-full transition-transform shadow-sm", currentUseAI && "translate-x-5")} />
                  </div>
               </div>
            </div>

            {currentUseAI ? (
               <div className="border-2 border-dashed border-(--brand-primary) bg-(--badge-primary-bg) rounded-xl p-6 text-center transition-colors">
                  {!currentAiImage ? (
                     <div className="py-6">
                        <Bot className="w-12 h-12 text-(--brand-primary) mx-auto mb-3" />
                        <h4 className="text-(--text-brand) font-medium mb-1">AI Poster Generator</h4>
                        <Button
                           type="button"
                           onClick={handleGenerateAiPoster}
                           disabled={isGeneratingAI || !currentTitle}
                           className="bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text) mt-4"
                        >
                           {isGeneratingAI ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                           ) : (
                              <><Sparkles className="w-4 h-4 mr-2" /> Generate Poster</>
                           )}
                        </Button>
                     </div>
                  ) : (
                     <div className="relative group">
                        <img src={currentAiImage} alt="AI Generated Poster" className="w-full h-48 object-cover rounded-lg shadow-(--shadow-md)" />
                        <div className="absolute inset-0 bg-(--bg-overlay) opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                           <Button type="button" size="sm" variant="secondary" onClick={handleGenerateAiPoster} disabled={isGeneratingAI || !currentTitle}>
                              {isGeneratingAI ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Regenerate</>}
                           </Button>
                           <Button type="button" size="sm" variant="destructive" onClick={() => setValue("aiGeneratedImage", null)}>
                              Remove
                           </Button>
                        </div>
                     </div>
                  )}
               </div>
            ) : (
               <div
                  className="group relative rounded-xl border-2 border-dashed border-(--border-muted) overflow-hidden cursor-pointer hover:border-(--brand-primary-light) transition-colors"
                  style={{ minHeight: "12rem" }}
               >
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />

                  {activePreview ? (
                     <>
                        <img src={activePreview} alt="Event poster" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 z-30 bg-(--image-overlay) opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center justify-center gap-2">
                           <Upload className="w-7 h-7 text-(--overlay-text)" />
                           <p className="text-(--overlay-text) text-sm font-medium">
                              {currentUploadedImage ? currentUploadedImage.name : "Click to replace image"}
                           </p>
                        </div>
                        <span className={cn(
                           "absolute top-2 right-2 z-30 text-xs px-2 py-0.5 rounded-full font-medium pointer-events-none",
                           currentUploadedImage ? "bg-(--status-success) text-(--overlay-text)" : "bg-(--badge-overlay) text-(--overlay-text)"
                        )}>
                           {currentUploadedImage ? "New image" : "Current poster"}
                        </span>
                     </>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-48 gap-2 text-center px-6">
                        <Upload className="w-8 h-8 text-(--text-tertiary)" />
                        <p className="text-sm text-(--text-secondary)">Click to upload image</p>
                        <p className="text-xs text-(--text-tertiary)">1920×1080px (JPG/PNG)</p>
                     </div>
                  )}
               </div>
            )}

            <FieldError message={errors.uploadedImage?.message || errors.aiGeneratedImage?.message} />
         </div>

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
         {showMapModal && (
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
         )}


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