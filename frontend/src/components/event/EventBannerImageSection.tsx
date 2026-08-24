// src/components/host/event/EventBannerImageSection.tsx

import React from "react";
import { useFormContext } from "react-hook-form";
import { Sparkles, Bot, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FieldError } from "../shared/FieldError";
import { type EventFormValues } from "@/schemas/event.schema";

interface EventBannerImageProps {
   isGeneratingAI: boolean;
   handleToggleAI: () => void;
   handleGenerateAiPoster: () => void;
   handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   activePreview: string | null;
}

export const EventBannerImageSection = ({
   isGeneratingAI,
   handleToggleAI,
   handleGenerateAiPoster,
   handleFileChange,
   activePreview,
}: EventBannerImageProps) => {
   const { watch, setValue, formState: { errors } } = useFormContext<EventFormValues>();
   
   const currentUseAI = watch("useAI");
   const currentAiImage = watch("aiGeneratedImage");
   const currentUploadedImage = watch("uploadedImage");
   const currentTitle = watch("title");

   return (
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
   );
};