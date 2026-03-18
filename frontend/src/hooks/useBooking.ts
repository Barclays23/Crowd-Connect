// frontend/src/hooks/useBooking.ts
import { useState } from "react";
import { bookingServices } from "@/services/bookingServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { IBookingState, InitiateBookingResponse } from "@/types/booking.types";
import type { RazorpayPaymentFailedResponse, RazorpayPaymentSuccessResponse } from "@/types/razorpay.types";
import { loadRazorpayScript } from "@/utils/razorpay.utils";
import { toast } from "react-toastify";


declare global {
    interface Window {
        Razorpay: any;
    }
}


interface UseBookingOptions {
    onSuccess?: (populatedBooking: IBookingState) => void;  // also add response message addition to populatedBooking
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

    const bookEvent = async (params: BookParams) => {
        if (isLoading) return;

        const {
            eventId,
            eventTitle,
            selectedQuantity,
            userName,
            userEmail,
            userPhone
        } = params;

        console.log('bookEvent Params :', params);

        setIsLoading(true);

        try {
            // Step 1 — call /bookings/initiate
            const response: InitiateBookingResponse = await bookingServices.initiateBooking(eventId, selectedQuantity);
            console.log('response from initiateBooking :', response)

            if (response.isFree) {
                setConfirmedBooking(response.populatedBooking);
                onSuccess?.(response.populatedBooking);
                return;

            } else {
                // ── PAID EVENT — open Razorpay SDK ───────────────────────────────────
                const scriptLoaded = await loadRazorpayScript();
                console.log('loadRazorpayScript scriptLoaded :', scriptLoaded);

                if (!scriptLoaded) {
                    throw new Error("Failed to load payment gateway. Check your internet connection.");
                }

                const { order } = response;

                await new Promise<void>((resolve, reject) => {
                    const rzp = new window.Razorpay({
                        key:         order.keyId,
                        amount:      order.amount,
                        currency:    order.currency,
                        name:        "CrowdConnect",
                        description: `Booking for ${eventTitle}`,
                        order_id:    order.orderId,
                        prefill: {
                            name:    userName,
                            email:   userEmail,
                            ...(userPhone && { contact: userPhone })
                        },
                        theme: { color: "var(--brand-primary, #6C63FF)" },
    
                        handler: async (response: RazorpayPaymentSuccessResponse) => {
                            try {
                                const booking: IBookingState = await bookingServices.verifyBookingPayment({
                                    bookingId: order.bookingId,
                                    paymentOrderId:   response.razorpay_order_id,
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
                            ondismiss: () => reject(new Error("CANCELLED_BY_USER")),
                        },
                    });
    
                    rzp.on("payment.failed", (res: RazorpayPaymentFailedResponse) => {
                        reject(new Error(res.error?.description ?? "Payment failed"));
                    });
    
                    rzp.open();
                });
            }

        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            // If the user just closed the modal, do nothing. Otherwise, show the error toast.
            if (errorMessage === "CANCELLED_BY_USER") {
                console.log("User closed the payment gateway.");
            } else {
                if (errorMessage) onError?.(errorMessage);
            }

        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => setConfirmedBooking(null);

    return { bookEvent, isLoading, confirmedBooking, reset };
}