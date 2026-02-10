// src/components/host/HostEventForm.tsx

// / <reference path="../../types/google.maps.d.ts" />
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  Calendar, Clock, MapPin, Users, Upload, Globe, Building2,
  FileText, Tag, Sparkles, PlusCircle, Bot, CheckCircle2,
  Loader2, IndianRupee,
} from "lucide-react";

// Components & Utils
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { ButtonLoader } from "../common/ButtonLoader";
import { TextArea } from "../ui/text-area";

// Schema & Services
import { eventFormSchema, type EventFormValues } from "@/schemas/event.schema";
import { eventServices } from "@/services/eventServices";
import { getApiErrorMessage, setServerZodErrors } from "@/utils/errorMessages.utils";
import { FieldError } from "../ui/FieldError";
import { ADMIN_COMMISSION_PERCENT, EVENT_CATEGORIES } from "@/types/event.types";
import { useGoogleMaps1 } from "@/contexts/GoogleMapsProvider1";
import { setupGooglePlaceAutocompleteWidget } from "@/utils/google-place-autocomplete-widget";
import { GooglePlacesAutoComplete } from "@/components/common/GooglePlacesAutoComplete";
import { useGoogleMaps2 } from "@/contexts/GoogleMapsProvider2";
import { GooglePlacesWidgetAutoComplete } from "@/components/common/GooglePlacesWidgetAutoComplete";

const mapContainerStyle = { width: "100%", height: "200px" };
const modalMapStyle = { width: "100%", height: "400px" };






const HostEventForm = () => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false); // For map picker modal
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 }); // Default center
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null); // Temp for modal

  const startDateRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const autocompleteWidgetRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema) as Resolver<EventFormValues>,
    defaultValues: {
      title: "",
      description: "",
      category: undefined as unknown as EventFormValues["category"],
      format: "offline" as const,
      ticketType: "free" as const,
      ticketPrice: 0,
      capacity: 0,
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      locationName: "",
      locationCoordinates: undefined,
      uploadedImage: null,
      aiGeneratedImage: null, // will hold data URL (base64 preview)
      useAI: false,
    },
  });
  
  
  const { ref: startDateHookRef, ...startDateRest } = register("startDate");
  const { ref: startTimeHookRef, ...startTimeRest } = register("startTime");
  const { ref: endDateHookRef, ...endDateRest } = register("endDate");
  const { ref: endTimeHookRef, ...endTimeRest } = register("endTime");
  
  // const { isLoaded } = useGoogleMaps1();  // if using GoogleLocationProvider1
  const { isLoaded } = useGoogleMaps2();    // if using GoogleLocationProvider2


  // Watch values for UI logic
  const currentFormat = watch("format");
  const currentTicketType = watch("ticketType");
  const currentTicketPrice = watch("ticketPrice");
  const currentUseAI = watch("useAI");
  const currentAiImage = watch("aiGeneratedImage"); // base64 data URL for preview
  const currentUploadedImage = watch("uploadedImage");
  const currentTitle = watch("title");
  const currentCategory = watch("category");
  const selectedCords = watch("locationCoordinates");

  // Calculate Earnings
  const estimatedEarnings =
    currentTicketPrice && Number(currentTicketPrice) > 0
      ? (Number(currentTicketPrice) * (1 - ADMIN_COMMISSION_PERCENT / 100)).toFixed(2)
      : "0.00";




  // can be used for both components: GooglePlacesAutoComplete & GooglePlacesWidgetAutoComplete
  const handlePlaceSelected = React.useCallback(
    ({ name, lat, lng, formattedAddress }: {
      name: string;
      lat: number;
      lng: number;
      formattedAddress?: string;
    }) => {
      const safeLat = Number(lat);
      const safeLng = Number(lng);

      // Optional: add validation / toast
      if (isNaN(safeLat) || isNaN(safeLng)) {
        console.warn("Invalid coordinates received", { lat, lng });
        toast.warn("Invalid location coordinates – please try again");
        return;
      }

      setValue("locationName", name, { shouldValidate: true });
      setValue("locationCoordinates", { lat: safeLat, lng: safeLng }, { shouldValidate: true });

      // Force validation update
      trigger(["locationName", "locationCoordinates"]);
    },
    [setValue, trigger]
  );




  const confirmMapSelection = () => {
    if (selectedPosition) {
      setValue("locationCoordinates", selectedPosition, { shouldValidate: true });
      setMapCenter(selectedPosition);
      setShowMapModal(false);
      toast.success("Location pinned!");
    }
  };


  const mapOptions = useMemo(() => ({
    disableDefaultUI: true, // Clean UI
    zoomControl: true,
  }), []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("uploadedImage", file);
      setValue("aiGeneratedImage", null); // Clear AI preview if manual upload
      trigger();
    }
  };
  

  const handleToggleAI = () => {
    setValue("useAI", !currentUseAI);
    setValue("uploadedImage", null);
    setValue("aiGeneratedImage", null);
  };

  // ── Generate AI Poster ──
  const handleGenerateAiPoster = async () => {
    const isValid = await trigger(["title", "category", "startDate", "startTime"]);
    if (!isValid) {
      toast.error("Please fill title, category, and start date/time first");
      return;
    }

    try {
      setIsGeneratingAI(true);

      const payload = {
        title: currentTitle,
        category: currentCategory,
        description: watch("description") || "",
        startDateTime: new Date(`${watch("startDate")}T${watch("startTime")}:00`).toISOString(),
        locationName: watch("locationName") || "",
      };

      const res = await fetch("/api/ai/generate-event-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate poster");
      }

      const { imageData } = await res.json(); // { base64, mimeType }

      const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
      setValue("aiGeneratedImage", dataUrl);
      setValue("uploadedImage", null);
      trigger();

      toast.success("Poster generated! You can regenerate or keep this one.");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate poster");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ── Submit Form ──
  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`).toISOString();
    const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`).toISOString();

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("startDateTime", startDateTime);
    formData.append("endDateTime", endDateTime);
    formData.append("format", data.format);
    formData.append("ticketType", data.ticketType);
    formData.append("ticketPrice", String(data.ticketPrice));
    formData.append("capacity", String(data.capacity));

    // Location Logic
    if (data.format === "offline") {
      formData.append("locationName", data.locationName || "");
      if (data.locationCoordinates) {
        formData.append(
          "location",
          JSON.stringify({
            type: "Point",
            coordinates: [data.locationCoordinates.lng, data.locationCoordinates.lat],
          })
        );
      }
    }

    // Image Logic
    if (data.useAI && data.aiGeneratedImage) {
      formData.append("aiPosterData", data.aiGeneratedImage); // base64 data URL
    } else if (data.uploadedImage) {
      formData.append("eventPosterImage", data.uploadedImage); // File
    }

    console.log("EVENT FORM DATA:", Object.fromEntries(formData.entries()));

    try {
      const response = await eventServices.createEvent(formData);
      toast.success("Event created successfully......!");
      // Optional: Navigate to dashboard or reset form
    } catch (error) {
      // console.error("Event form submission error:", error);
      const errorMessage = getApiErrorMessage(error);
      if (errorMessage) toast.error(errorMessage);
      setServerZodErrors<EventFormValues>(error, setError);

    } finally {

    }
  };



  return (
    <div className="min-h-screen bg-(--bg-primary) px-4 py-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-primary">
            <Sparkles className="w-10 h-10 text-(--text-inverse)" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-(--heading-primary)">Host an Event</h1>
          <p className="max-w-md mx-auto text-(--text-secondary)">
            Fill in the details below. As a Host, you can create unlimited events.
          </p>
        </div>

        <div className="rounded-2xl p-8 bg-(--card-bg) border border-(--card-border) shadow-(--shadow-lg) transition-colors duration-300">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    setValue("category", val as typeof EVENT_CATEGORIES[number], {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
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
                <TextArea
                  {...register("description")}
                  rows={4}
                  placeholder="Describe your event..."
                />
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
                      min={new Date().toISOString().split("T")[0]}
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
                      min={new Date().toISOString().split("T")[0]}
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
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        currentFormat === "offline" ? "text-(--brand-primary)" : "text-(--text-primary)"
                      )}
                    >
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
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        currentFormat === "online" ? "text-(--brand-primary)" : "text-(--text-primary)"
                      )}
                    >
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

                  {/* GOOGLE PLACE AUTO COMPLETE (OPTION-2) */}
                  {/* <GooglePlacesAutoComplete
                    defaultValue={watch("locationName") || ""}
                    onPlaceSelected={handlePlaceSelected} // your helper function
                    placeholder="Search venue, city or address in Kerala..."
                    className="w-full"
                  /> */}

                  {/* GOOGLE PLACE AUTO COMPLETE (OPTION-1: WIDGET) */}
                  <GooglePlacesWidgetAutoComplete
                    onPlaceSelected={handlePlaceSelected}
                    placeholder="Search venue, city or address in Kerala..."
                    className="w-full"
                  />

                  {watch("locationName") && watch("locationCoordinates") && (
                    <div className="mt-1.5 text-sm text-gray-600 italic">
                      {watch("locationName")}
                    </div>
                  )}
                  {watch("locationCoordinates") && (
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
                          currentTicketType === "free"
                            ? "bg-(--status-success) text-(--text-inverse)"
                            : "bg-(--bg-tertiary) text-(--text-tertiary)"
                        )}
                      >
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "font-semibold",
                            currentTicketType === "free" ? "text-(--status-success)" : "text-(--text-primary)"
                          )}
                        >
                          Free Event
                        </p>
                      </div>
                    </div>
                    {currentTicketType === "free" && (
                      <CheckCircle2 className="w-5 h-5 text-(--status-success)" />
                    )}
                  </div>
                </div>

                {/* Paid Card */}
                <div
                  onClick={() => setValue("ticketType", "paid")}
                  className={cn(
                    "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:border-(--brand-primary-light)",
                    currentTicketType === "paid"
                      ? "border-(--brand-primary) bg-(--badge-primary-bg)"
                      : "border-(--border-muted) bg-(--card-bg) hover:bg-(--bg-tertiary)"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          currentTicketType === "paid"
                            ? "bg-(--brand-primary) text-(--text-inverse)"
                            : "bg-(--bg-tertiary) text-(--text-tertiary)"
                        )}
                      >
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "font-semibold",
                            currentTicketType === "paid" ? "text-(--brand-primary)" : "text-(--text-primary)"
                          )}
                        >
                          Paid Event
                        </p>
                      </div>
                    </div>
                    {currentTicketType === "paid" && (
                      <CheckCircle2 className="w-5 h-5 text-(--brand-primary)" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {/* Ticket Price */}
                <div
                  className={cn(
                    "transition-all duration-300",
                    currentTicketType === "free" ? "opacity-75" : "opacity-100"
                  )}
                >
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

                  {/* Commission Calculation */}
                  {currentTicketType === "paid" && Number(currentTicketPrice || 0) > 0 && (
                    <div className="mt-2 text-xs text-(--text-secondary) flex flex-col gap-1 bg-(--bg-secondary) p-2 rounded-md">
                      <div className="flex justify-between">
                        <span>Platform Fee ({ADMIN_COMMISSION_PERCENT}%):</span>
                        <span className="text-(--status-error)">
                          - ₹{((Number(currentTicketPrice) * ADMIN_COMMISSION_PERCENT) / 100).toFixed(2)}
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
                      currentUseAI ? "bg-(--brand-primary)" : "bg-(--bg-tertiary)"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 left-1 w-4 h-4 bg-(--text-inverse) rounded-full transition-transform shadow-sm",
                        currentUseAI && "translate-x-5"
                      )}
                    />
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
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" /> Generate Poster
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={currentAiImage}
                        alt="AI Generated Poster"
                        className="w-full h-48 object-cover rounded-lg shadow-(--shadow-md)"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                        <Button size="sm" variant="secondary" onClick={handleGenerateAiPoster}>
                          Regenerate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setValue("aiGeneratedImage", null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-xl p-8 text-center border-2 border-dashed border-(--border-muted) hover:bg-(--bg-secondary) transition-colors cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-(--text-tertiary)" />
                  {currentUploadedImage ? (
                    <div>
                      <p className="font-medium text-(--text-primary)">{currentUploadedImage.name}</p>
                      <p className="text-xs text-(--status-success) mt-1">Ready to upload</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-(--text-secondary)">Click to upload image</p>
                      <p className="text-xs text-(--text-tertiary) mt-1">1920×1080px (JPG/PNG)</p>
                    </div>
                  )}
                </div>
              )}
              <FieldError message={errors.uploadedImage?.message || errors.aiGeneratedImage?.message} />
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={isSubmitting || isGeneratingAI}
              className="w-full py-6 text-base bg-gradient-primary text-(--text-inverse) hover:opacity-90 transition-opacity shadow-(--shadow-md)"
            >
              <ButtonLoader loading={isSubmitting || isGeneratingAI} loadingText="Creating Event...">
                <PlusCircle className="w-5 h-5 mr-2" /> Create Event
              </ButtonLoader>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HostEventForm;

// THINGS TO DO:
// 2. Real AI Integration (replace mock):
// 3. Error Handling & Loading States, Spinners, and disable all fields during submit