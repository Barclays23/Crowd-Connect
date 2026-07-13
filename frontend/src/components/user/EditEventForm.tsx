import { HostEventForm } from "@/components/host/HostEventForm";
import type { EventStatus } from "@/constants/event.constants";
import { eventFormSchemaFactory, type EventFormValues } from "@/schemas/event.schema";
import { platformSettingsService } from "@/services/platformSettingsService";
import type { ApiResponse } from "@/types/common.types";
import type { IEventState } from "@/types/event.types";
import type { IPlatformSettings } from "@/types/platformSettings.types";
import { toLocalInputDateTime } from "@/utils/dateAndTimeFormats";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "react-toastify";


// ── Drop-in replacement: owns its own form, initialised with correct defaults ──
interface EditEventFormProps {
  editEvent: IEventState;
  onSubmit: (data: EventFormValues) => Promise<void>;
  onCancel: () => void;
}



const EditEventForm = ({ editEvent, onSubmit, onCancel }: EditEventFormProps) => {
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response: ApiResponse<IPlatformSettings> = await platformSettingsService.getSettings();
        console.log('fetched settings:', response);
        setCommissionPercent(response?.data?.commissionPercent ?? commissionPercent);

      } catch (error: unknown) {
        console.warn("Could not load platform settings, using default commission :", error);
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage);
        toast.error("Failed to load platform settings----------");

      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const start = toLocalInputDateTime(editEvent.startDateTime);
  const end   = toLocalInputDateTime(editEvent.endDateTime);

  const hasExistingImage = !!editEvent.posterUrl;
  // const schema = hasExistingImage ? editEventFormSchema : createEventFormSchema;
  const schema = eventFormSchemaFactory(
    hasExistingImage, 
    true, // isEditMode
    editEvent.eventStatus as EventStatus
  );
  

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(schema) as Resolver<EventFormValues>,
    defaultValues: {
      title:       editEvent.title,
      description: editEvent.description || "",
      category:    editEvent.category as EventFormValues["category"],
      format:      editEvent.format,
      ticketType:  editEvent.ticketType  || "free",
      ticketPrice: editEvent.ticketPrice || 0,
      capacity:    editEvent.capacity    || 0,
      startDate:   start.date,
      startTime:   start.time,
      endDate:     end.date,
      endTime:     end.time,
      locationName: editEvent.locationName || "",
      locationCoordinates: editEvent.location?.coordinates
        ? { lat: editEvent.location.coordinates[1], lng: editEvent.location.coordinates[0] }
        : undefined,
      useAI:            false,
      uploadedImage:    null,
      aiGeneratedImage: null,
    },
  });

  return (
    <FormProvider {...methods}>
      <HostEventForm
        isEditMode={true}
        existingImageUrl={editEvent.posterUrl || undefined}
        onSubmit={onSubmit}
        onCancel={onCancel}
        commissionPercent={commissionPercent}
      />
    </FormProvider>
  );
};

export default EditEventForm;