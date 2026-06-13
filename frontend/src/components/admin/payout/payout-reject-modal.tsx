// frontend/src/components/admin/payout/payout-reject-modal.tsx
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatNumberToINR } from "@/utils/UI.utils";
import type { IPayoutRequest } from "@/types/payout.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RejectPayoutSchema, type RejectPayoutFormValues } from "@/schemas/payout.schema";
import { FieldError } from "@/components/ui/FieldError";

interface PayoutRejectModalProps {
   isOpen      : boolean;
   payout      : IPayoutRequest | null;
   onClose     : () => void;
   onConfirm   : (reason: string) => void;
   isRejecting : boolean;
}

export function PayoutRejectModal({ isOpen, payout, onClose, onConfirm, isRejecting }: PayoutRejectModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset
    } = useForm<RejectPayoutFormValues>({
        resolver: zodResolver(RejectPayoutSchema),
        mode: "onChange",
        defaultValues: {
                reason: ""
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({ reason: "" });
        }
    }, [isOpen, reset]);

    const onSubmit = (data: RejectPayoutFormValues) => {
        onConfirm(data.reason);
    };




    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reject Payout Request" size="md">
            {/* Replaced standard div with a form element */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-(--text-secondary)">
                    You are rejecting the payout request of{" "}
                    <span className="font-semibold text-(--text-primary)">{formatNumberToINR(payout?.netAmount ?? 0)}</span>{" "}
                    for <span className="font-semibold text-(--text-primary)">"{payout?.eventTitle}"</span>.
                    The host will be notified with your reason.
                </p>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-(--text-primary)">
                        Reason <span className="text-(--status-error)">*</span>
                    </label>
                    <textarea
                        {...register("reason")}
                        className={`w-full min-h-24 p-3 rounded-md border bg-(--form-input-bg) text-(--form-input-text) text-sm shadow-sm placeholder:text-(--form-placeholder) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--brand-primary) ${
                            errors.reason ? 'border-(--status-error)' : 'border-(--form-border)'
                        }`}
                        placeholder="Provide a clear reason so the host can understand and resubmit if needed…"
                        disabled={isRejecting}
                    />
                    {errors.reason && <FieldError message={errors.reason.message} />}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isRejecting}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="destructive"
                        disabled={isRejecting || !isValid}
                    >
                        {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Rejection
                    </Button>
                </div>
            </form>
        </Modal>
    );
}