// frontend/src/hooks/useBooking.ts
import { useState } from "react";
import { bookingServices } from "@/services/bookingServices";
// import { loadRazorpayScript } from "@/utils/razorpay";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { IBookingState, InitiateBookingResponse } from "@/types/booking.types";


interface UseBookingOptions {
    onSuccess?: (populatedBooking: IBookingState) => void;  // also add response message
    onError?:   (message: string) => void;
}

interface BookParams {
    eventId:    string;
    eventTitle: string;
    selectedQuantity:   number;
    userName:   string;
    userEmail:  string;
    userPhone?: string;
}

export function useBooking({ onSuccess, onError }: UseBookingOptions = {}) {
    const [isLoading, setIsLoading]               = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<IBookingState | null>(null);

    const bookEvent = async ({
        eventId,
        eventTitle,
        selectedQuantity,
        userName,
        userEmail,
        userPhone,
    }: BookParams) => {
        setIsLoading(true);

        try {
            // Step 1 — call /bookings/initiate
            const response:InitiateBookingResponse = await bookingServices.initiateBooking(eventId, selectedQuantity);

            if (response.isFree) {
                setConfirmedBooking(response.populatedBooking);
                onSuccess?.(response.populatedBooking);
                return;

            } else {
                // ── PAID EVENT — open Razorpay SDK ───────────────────────────────────
                // const scriptLoaded = await loadRazorpayScript();
                // if (!scriptLoaded) {
                //     throw new Error("Failed to load payment gateway. Check your internet connection.");
                // }

                const { order } = response;

                await new Promise<void>((resolve, reject) => {
                    const rzp = new (window as any).Razorpay({
                        key:         order.keyId,
                        amount:      order.amount,
                        currency:    order.currency,
                        name:        "CrowdConnect",
                        description: `Booking for ${eventTitle}`,
                        order_id:    order.orderId,
                        prefill: {
                            name:    userName,
                            email:   userEmail,
                            contact: userPhone ?? "",
                        },
                        theme: { color: "var(--brand-primary, #6C63FF)" },
    
                        handler: async (response: {
                            razorpay_order_id:   string;
                            razorpay_payment_id: string;
                            razorpay_signature:  string;
                        }) => {
                            try {
                            // Step 2 — verify payment
                            const booking: IBookingState = await bookingServices.verifyPayment({
                                orderId:   response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                            });
    
                            setConfirmedBooking(booking);
                            onSuccess?.(booking);
                            resolve();
                        } catch (err) {
                            reject(new Error(getApiErrorMessage(err) ?? "Payment verification failed"));
                        }
                    },
    
                    modal: {
                        ondismiss: () => reject(new Error("Payment was cancelled")),
                    },
                    });
    
                        rzp.on("payment.failed", (res: any) => {
                        reject(new Error(res.error?.description ?? "Payment failed"));
                    });
    
                    rzp.open();
                });
            }

        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) onError?.(errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => setConfirmedBooking(null);

    return { bookEvent, isLoading, confirmedBooking, reset };
}