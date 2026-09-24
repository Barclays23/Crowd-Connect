// src/components/event/EventBannerAiSection.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import { Sparkles, Bot, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/shared/FieldError";
import { generatePosterSchema } from "@/schemas/ai.schema";
import { aiServices } from "@/services/aiServices";
import type { EventFormValues } from "@/schemas/event.schema";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";

interface Props {
  existingImageUrl?: string;
  isGeneratingAI: boolean;
  setIsGeneratingAI: (val: boolean) => void;
}

export const EventBannerAiSection = ({ existingImageUrl, isGeneratingAI, setIsGeneratingAI }: Props) => {
  const { setValue, watch, trigger, getValues, formState: { errors } } = useFormContext<EventFormValues>();

  const currentUseAI = watch("useAI");
  const currentAiImage = watch("aiGeneratedImage");
  const currentUploadedImage = watch("uploadedImage");
  const currentTitle = watch("title");

  const uploadedPreviewUrl = currentUploadedImage ? URL.createObjectURL(currentUploadedImage) : null;
  const activePreview = currentAiImage || uploadedPreviewUrl || existingImageUrl || null;

  const handleToggleAI = () => {
    setValue("useAI", !currentUseAI);
    setValue("uploadedImage", null);
    setValue("aiGeneratedImage", null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("uploadedImage", file);
      setValue("aiGeneratedImage", null);
      trigger();
    }
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
      const payload = {
        title: currentValues.title,
        category: currentValues.category,
        description: currentValues.description,
        startDateTime: new Date(`${currentValues.startDate}T${currentValues.startTime}:00`).toISOString(),
        locationName: currentValues.locationName || (currentValues.format === "online" ? "Virtual Event" : ""),
      };
      const response = await aiServices.generateEventPoster(payload);
      if (response.data.base64Data) {
        setValue("aiGeneratedImage", response.data.base64Data, { shouldValidate: true, shouldDirty: true });
        setValue("uploadedImage", null);
        toast.success(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || "Failed to generate AI poster.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-(--text-primary) flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-(--brand-primary)" /> Event Banner
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-(--text-secondary)">Enable AI</span>
          <div onClick={handleToggleAI} className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300", currentUseAI ? "bg-(--brand-primary)" : "bg-(--bg-tertiary) border border-(--border-brand)")}>
            <div className={cn("absolute top-1 left-1 w-4 h-4 bg-(--text-inverse) rounded-full transition-transform", currentUseAI && "translate-x-5")} />
          </div>
        </div>
      </div>

      {currentUseAI ? (
        <div className="border-2 border-dashed border-(--brand-primary) bg-(--badge-primary-bg) rounded-xl p-6 text-center">
          {!currentAiImage ? (
            <div className="py-6">
              <Bot className="w-12 h-12 text-(--brand-primary) mx-auto mb-3" />
              <Button type="button" onClick={handleGenerateAiPoster} disabled={isGeneratingAI || !currentTitle}>
                {isGeneratingAI ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : "Generate Poster"}
              </Button>
            </div>
          ) : (
             <div className="relative group">
                <img src={currentAiImage} alt="AI Generated Poster" className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-(--bg-overlay) opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                   <Button type="button" size="sm" onClick={handleGenerateAiPoster}>Regenerate</Button>
                   <Button type="button" size="sm" variant="destructive" onClick={() => setValue("aiGeneratedImage", null)}>Remove</Button>
                </div>
             </div>
          )}
        </div>
      ) : (
        <div className="group relative rounded-xl border-2 border-dashed overflow-hidden cursor-pointer h-48" >
          <Input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
          {activePreview ? (
             <img src={activePreview} className="w-full h-48 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
               <Upload className="w-8 h-8 text-(--text-tertiary)" />
               <p className="text-sm">Click to upload image</p>
            </div>
          )}
        </div>
      )}
      <FieldError message={errors.uploadedImage?.message || errors.aiGeneratedImage?.message} />
    </div>
  );
};