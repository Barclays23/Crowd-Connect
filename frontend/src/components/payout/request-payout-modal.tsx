// frontend/src/components/payout/request-payout-modal.tsx
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { PayoutEventFormCard } from "@/components/payout/PayoutEventFormCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PayoutRequestSchema, type PayoutRequestFormValues } from "@/schemas/payout.schema";
import { payoutServices } from "@/services/payoutServices";
import type { IPayoutEligibleEvent } from "@/types/payout.types";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { formatNumberToINR } from "@/utils/UI.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";


interface RequestPayoutModalProps {
    isOpen        : boolean;
    onClose       : () => void;
    onRequested   : () => void;
}



export function RequestPayoutModal({ isOpen, onClose, onRequested }: RequestPayoutModalProps) {
    const [eligibleEvents, setEligibleEvents] = useState<IPayoutEligibleEvent[]>([]);
    const [commissionRate, setCommissionRate] = useState(0.10);
    const [minAttendance, setMinAttendance]   = useState(30);
    const [loading, setLoading]               = useState(true);
    

    useEffect(() => {
        if (!isOpen) return;

        const fetchEligibleEvents = async () => {
            setLoading(true);
            try {
                const res = await payoutServices.getEligibleEvents();
                setEligibleEvents(res.events);
                setCommissionRate(res.commissionRate);
                setMinAttendance(res.minAttendancePercent);

            } catch (error: unknown) {
                const errorMessage = getApiErrorMessage(error);
                if (errorMessage) toast.error(errorMessage);

            } finally {
                setLoading(false);
            }
        };

        fetchEligibleEvents();
    }, [isOpen]);



    const handleSuccess = () => {
        onRequested();
        onClose();
    };


    const unRequestedEvents = eligibleEvents.filter((e) => !e.payoutRequested);


return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Payout" size="lg">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner1 size="md" message="Loading eligible events..." />
                    </div>
                ) : unRequestedEvents.length === 0 ? (
                    <div className="rounded-xl p-6 text-center bg-(--bg-secondary) border border-(--card-border)">
                        <Wallet className="mx-auto h-10 w-10 mb-3 text-(--text-tertiary) opacity-40" />
                        <p className="font-semibold text-(--text-primary)">No eligible events available</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {unRequestedEvents.map((event) => (
                            <PayoutEventFormCard 
                                key={event.eventId} 
                                event={event} 
                                commissionRate={commissionRate} 
                                minAttendance={minAttendance}
                                onSuccess={handleSuccess}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-(--border-muted)">
                <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
}

