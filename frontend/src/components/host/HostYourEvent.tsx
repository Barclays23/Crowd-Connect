// src/components/host/HostYourEvent.tsx

// <reference path="../../types/google.maps.d.ts" />
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {Sparkles} from "lucide-react";


// Schema & Services
import { createEventFormSchema, type EventFormValues } from "@/schemas/event.schema";
import { HostEventForm } from "@/components/host/HostEventForm";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { eventServices } from "@/services/eventServices";
import { useEffect, useState } from "react";
import { platformSettingsService } from "@/services/platformSettingsService";
import type { SettingsResponse } from "@/types/platformSettings.types";
import { useNavigate } from "react-router-dom";




const HostYourEvent = () => {
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [loading, setLoading]   = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommissionPercent = async () => {
        try {
          setLoading(true);
          const response: SettingsResponse = await platformSettingsService.getSettings();
          setCommissionPercent(response?.settingsData?.commissionPercent ?? commissionPercent);

        } catch (error: unknown) {
          console.warn("Could not load platform settings, using default commission :", error);

        } finally {
          setLoading(false);
        }
    };
    
    fetchCommissionPercent();
  }, []);

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(createEventFormSchema) as Resolver<EventFormValues>,
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

  const handleSubmit = async (data: EventFormValues) => {
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

    if (data.format === "offline") {
      formData.append("locationName", data.locationName || "");
      if (data.locationCoordinates) {
        formData.append("location", JSON.stringify({
          type: "Point",
          coordinates: [data.locationCoordinates.lng, data.locationCoordinates.lat],
        }));
      }
    }

    if (data.useAI && data.aiGeneratedImage) {
      formData.append("aiGeneratedImage", data.aiGeneratedImage);
    } else if (data.uploadedImage) {
      formData.append("eventPosterImage", data.uploadedImage);
    }

    try {
      const response = await eventServices.createEvent(formData);
      toast.success(response.message);
      methods.reset();
      navigate('/my-events');

    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      if (errorMessage) toast.error(errorMessage);
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
          <FormProvider {...methods}>
            <HostEventForm
              isEditMode={false}
              onSubmit={handleSubmit}
              commissionPercent={commissionPercent}
            />
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default HostYourEvent;