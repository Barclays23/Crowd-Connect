// frontend/src/components/payout/request-payout-modal.tsx
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { PayoutEventFormCard } from "@/components/payout/PayoutEventFormCard";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { payoutServices } from "@/services/payoutServices";
import type { GetEligibleEventsApiResponse, IPayoutEligibleEvent } from "@/types/payout.types";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
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
                const res: GetEligibleEventsApiResponse = await payoutServices.getEligibleEvents();

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


    const displayEligibleEvents = eligibleEvents.filter((e) => !e.payoutRequested || e.canReapply);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Payout" size="lg">
            <div className="space-y-5">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner1 size="md" message="Loading eligible events..." />
                    </div>
                ) : displayEligibleEvents.length === 0 ? (
                    <div className="rounded-xl p-6 text-center bg-(--bg-secondary) border border-(--card-border)">
                        <Wallet className="mx-auto h-10 w-10 mb-3 text-(--text-tertiary) opacity-40" />
                        <p className="font-semibold text-(--text-primary)">No eligible events available</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {displayEligibleEvents.map((event) => (
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

