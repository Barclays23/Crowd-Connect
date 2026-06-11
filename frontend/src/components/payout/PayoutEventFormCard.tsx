// frontend/src/components/payout/PayoutEventFormCard.tsx
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/input";
import { PayoutRequestSchema, type PayoutRequestFormValues } from "@/schemas/payout.schema";
import { payoutServices } from "@/services/payoutServices";
import type { IPayoutEligibleEvent } from "@/types/payout.types";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { formatNumberToINR } from "@/utils/UI.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setError } = useForm<PayoutRequestFormValues>({
        resolver: zodResolver(PayoutRequestSchema),
        defaultValues: { eventId: event.eventId }
    });

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    
    const selectedFiles = watch("proofs");

    useEffect(() => {
        if (selectedFiles && selectedFiles.length > 0) {
            const urls = Array.from(selectedFiles).map((file) => URL.createObjectURL(file));
            setPreviewUrls(urls);
            return () => urls.forEach(url => URL.revokeObjectURL(url));
        } else {
            setPreviewUrls([]);
        }
    }, [selectedFiles]);

    const attendancePercent = event.soldTickets > 0 
        ? Math.round(((event as any).checkedInCount ?? 0) / event.soldTickets * 100) 
        : 0;
    const needsProof = attendancePercent < minAttendance;
    const commAmount = Math.round(event.grossTicketRevenue * commissionRate);
    const net = event.grossTicketRevenue - commAmount;

    const onSubmit = async (data: PayoutRequestFormValues) => {
        toast.info('requesting payout...');
        // Enforce proof requirement if attendance is low
        if (needsProof && (!data.proofs || data.proofs.length === 0)) {
            setError("proofs", { type: "manual", message: "Proof images are required due to low attendance." });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("eventId", data.eventId);

            if (data.proofs && data.proofs.length > 0) {
                Array.from(data.proofs).forEach((file: File) => {
                    formData.append("payout-proofs", file);
                });
            }

            const res = await payoutServices.requestPayout(formData);
            toast.success(res.message);
            onSuccess();
        } catch (error: unknown) {
            const errorMessages = getApiErrorMessage(error);
            if (errorMessages) toast.error(errorMessages);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl p-5 bg-(--bg-secondary) border border-(--card-border) space-y-4 shadow-sm">
            {/* Hidden input to satisfy Zod's eventId requirement */}
            <input type="hidden" {...register("eventId")} />

            <h3 className="font-bold text-lg text-(--heading-primary)">{event.title}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-(--bg-primary) p-4 rounded-lg border border-(--border-muted)">
                <Row label="Tickets Sold" value={`${event.soldTickets}`} />
                <Row label="Attendance" value={`${attendancePercent}%`} className={needsProof ? "text-destructive" : "text-(--status-success)"} />
                <Row label="Gross Revenue" value={formatNumberToINR(event.grossTicketRevenue)} />
                <Row label={`Platform Fee (${commissionRate * 100}%)`} value={`− ${formatNumberToINR(commAmount)}`} className="text-(--status-error)" />
                <div className="col-span-2 border-t border-(--border-muted) pt-3 mt-1">
                    <Row label="You Receive" value={formatNumberToINR(net)} className="text-(--status-success) font-extrabold text-base" />
                </div>
            </div>

            {needsProof && (
                <div className="bg-(--badge-danger-bg) border border-(--border-brand) p-4 rounded-lg flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        Attendance ({attendancePercent}%) is below {minAttendance}%. Proof required.
                    </div>
                    <div>
                        <Input 
                            type="file" 
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            {...register("proofs")}
                            className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-(--brand-primary-light) file:text-white hover:file:bg-(--brand-primary)"
                        />
                        <FieldError message={errors.proofs?.message?.toString()} />
                    </div>

                    {/* Previews */}
                    {previewUrls.length > 0 && (
                        <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                            {previewUrls.map((url, i) => (
                                <div key={i} className="relative w-16 h-16 shrink-0 rounded-md border overflow-hidden">
                                    <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
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