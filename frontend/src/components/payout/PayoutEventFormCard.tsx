// frontend/src/components/payout/PayoutEventFormCard.tsx
// frontend/src/components/payout/PayoutEventFormCard.tsx
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/FieldError";
import { PayoutRequestSchema, type PayoutRequestFormValues } from "@/schemas/payout.schema";
import { payoutServices } from "@/services/payoutServices";
import type { ApiResponse } from "@/types/common.types";
import type { IPayoutEligibleEvent, IPayoutState } from "@/types/payout.types";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { formatNumberToINR } from "@/utils/UI.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Info, Loader2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";




export function PayoutEventFormCard({ 
    event, 
    commissionRate, 
    minAttendance, 
    onSuccess 
}: { 
    event: IPayoutEligibleEvent; 
    commissionRate: number; 
    minAttendance: number; 
    onSuccess: () => void;
}) {
    const { 
        handleSubmit, 
        formState: { errors, isSubmitting }, 
        setValue, 
        setError, 
        clearErrors 
    } = useForm<PayoutRequestFormValues>({
        resolver: zodResolver(PayoutRequestSchema),
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const checkedInCount    = event.checkedInCount ?? 0;
    const soldTickets       = event.soldTickets ?? 0;
    const attendancePercent = soldTickets > 0 
        ? Math.round((checkedInCount / soldTickets) * 100) 
        : 0;
    
    const needsProof = attendancePercent < minAttendance;
    const commAmount = Math.round(event.grossTicketRevenue * commissionRate);
    const netAmount  = event.grossTicketRevenue - commAmount;

    useEffect(() => {
        const urls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [selectedFiles]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const incomingFiles = Array.from(e.target.files);
        
        // Ensure max 3 files
        if (selectedFiles.length + incomingFiles.length > 3) {
            toast.error("You can only upload a maximum of 3 images.");
            return;
        }

        const updatedFiles = [...selectedFiles, ...incomingFiles];
        setSelectedFiles(updatedFiles);
        setValue("proofs", updatedFiles, { shouldValidate: true }); 
        if (needsProof && updatedFiles.length > 0) clearErrors("proofs");
        
        // Reset input value so the same file can be selected again if removed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Handle file removal
    const removeFile = (indexToRemove: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== indexToRemove);
        setSelectedFiles(updatedFiles);
        setValue("proofs", updatedFiles, { shouldValidate: true }); 
        
        if (needsProof && updatedFiles.length === 0) {
            setError("proofs", { type: "manual", message: "Proof images are required due to low attendance." });
        }
    };

    const onSubmit = async () => {
        if (needsProof && selectedFiles.length === 0) {
            setError("proofs", { type: "manual", message: "Proof images are required due to low attendance." });
            return;
        }

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append("payout-proofs", file);
            });

            const res: ApiResponse<IPayoutState> = await payoutServices.requestPayout(event.eventId, formData);

            toast.success(res.message);
            onSuccess();

        } catch (error: unknown) {
            const errorMessages = getApiErrorMessage(error);
            if (errorMessages) toast.error(errorMessages);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl p-5 bg-(--bg-secondary) border border-(--card-border) space-y-4 shadow-sm">
            <h3 className="font-bold text-lg text-(--heading-primary)">{event.title}</h3>

            {/* Rejection Banner - Now using dynamic CSS variables */}
            {event.canReapply && event.previousRejectionReason && (
                <div className="bg-(--badge-error-bg) border border-(--badge-error-border) text-(--badge-error-text) p-3 rounded-md flex gap-2 items-start text-sm">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        <strong>Previous Request Rejected:</strong> {event.previousRejectionReason}
                        <br/>
                        <span className="opacity-90 mt-1 block">Please fix the issue and submit new proof below.</span>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-(--bg-primary) p-4 rounded-lg border border-(--border-muted)">
                <Row label="Tickets Sold" value={`${soldTickets}`} />
                <Row label="Checked In Count" value={`${checkedInCount}`} />
                <Row 
                    label="Attendance Rate" 
                    value={`${attendancePercent}%`} 
                    className={needsProof ? "text-(--status-error) font-bold" : "text-(--status-success)"} 
                />
                <Row label="Gross Revenue" value={formatNumberToINR(event.grossTicketRevenue)} />
                <Row 
                    label={`Platform Fee (${(commissionRate * 100).toFixed(0)}%)`} 
                    value={`− ${formatNumberToINR(commAmount)}`} 
                    className="text-(--status-error)" 
                />
                <div className="col-span-2 border-t border-(--border-muted) pt-3 mt-1">
                    <Row 
                        label="You Receive" 
                        value={formatNumberToINR(netAmount)} 
                        className="text-(--status-success) font-extrabold text-base" 
                    />
                </div>
            </div>

            {needsProof && (
                <div className="bg-(--badge-error-bg) border border-(--badge-error-border) p-4 rounded-lg flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-2 text-(--status-error) text-sm font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        Attendance ({attendancePercent}%) is below {minAttendance}%. Proof required.
                    </div>

                    {/* Custom File Upload UI */}
                    <div>
                        <input 
                            type="file" 
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={selectedFiles.length >= 3}
                        >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Select Proof Images ({selectedFiles.length}/3)
                        </Button>
                        <FieldError message={errors.proofs?.message?.toString()} />
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                        <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                            {previewUrls.map((url, i) => (
                                <div key={url} className="relative w-24 h-24 shrink-0 rounded-md border border-(--border-muted) overflow-hidden group">
                                    <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
                                    {/* Using CSS variables for the image hover overlay */}
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="absolute top-1 right-1 bg-(--badge-overlay) text-(--overlay-text) rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-end pt-4 mt-2">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit Request
                </Button>
            </div>
        </form>
    );
}

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-(--text-secondary)">{label}</span>
            <span className={`font-semibold text-(--text-primary) ${className}`}>{value}</span>
        </div>
    );
}