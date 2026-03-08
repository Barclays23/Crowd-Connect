import { HostEventForm } from "@/components/host/HostEventForm";
import { createEventFormSchema, editEventFormSchema, eventFormSchemaFactory, type EventFormValues } from "@/schemas/event.schema";
import type { EVENT_STATUS, IEventState } from "@/types/event.types";
import { toLocalInputDateTime } from "@/utils/dateAndTimeFormats";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Resolver } from "react-hook-form";


// ── Drop-in replacement: owns its own form, initialised with correct defaults ──
interface EditEventFormProps {
  editEvent: IEventState;
  onSubmit: (data: EventFormValues) => Promise<void>;
  onCancel: () => void;
}



const EditEventForm = ({ editEvent, onSubmit, onCancel }: EditEventFormProps) => {
  const start = toLocalInputDateTime(editEvent.startDateTime);
  const end   = toLocalInputDateTime(editEvent.endDateTime);

  const hasExistingImage = !!editEvent.posterUrl;
  // const schema = hasExistingImage ? editEventFormSchema : createEventFormSchema;
  const schema = eventFormSchemaFactory(
    hasExistingImage, 
    true, // isEditMode
    editEvent.eventStatus as EVENT_STATUS
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
      />
    </FormProvider>
  );
};

export default EditEventForm;