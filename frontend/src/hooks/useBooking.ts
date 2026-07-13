// frontend/src/hooks/useBooking.ts
import { useState } from "react";
import { bookingServices } from "@/services/bookingServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { 
    InitiateBookingParams, 
    BookingPaymentOrder, 
    IBookingState, 
    InitiateBookingResponse, 
    RetryBookingParams
} from "@/types/booking.types";
import { openRazorpayCheckout } from "@/utils/razorpay.utils";
import { logger } from "@/utils/logger";
import { initiateBookingSchema } from "@/schemas/booking.schema";
import { PAYMENT_METHODS } from "@/constants/payment.constants";
import type { ApiResponse } from "@/types/common.types";



interface UseBookingOptions {
    onSuccess?  : (populatedBooking: IBookingState) => void;  // also add response message addition to populatedBooking
    onError?    : (message: string) => void;
}





export function useBooking({ onSuccess, onError }: UseBookingOptions = {}) {
    const [isLoading, setIsLoading]               = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<IBookingState | null>(null);


    const handleCheckout = async (
        order       : BookingPaymentOrder, 
        eventTitle  : string, 
        userName    : string, 
        userEmail   : string, 
        userPhone?  : string
    ) => {
        await openRazorpayCheckout({
            order       : order,
            description : `Booking for ${eventTitle}`,
            // name        : "CrowdConnect",
            // image       : "https://your-domain.com/assets/logo.png", 
            // theme       : { color: "#6C63FF" },
            prefill     : { 
                name        : userName, 
                email       : userEmail, 
                contact     : userPhone 
            },
            onVerify    : async (response) => {
                const apiResponse: ApiResponse<IBookingState> = await bookingServices.verifyBookingPayment({
                    bookingId      : order.bookingId,
                    paymentOrderId : response.razorpay_order_id,
                    paymentId      : response.razorpay_payment_id,
                    signature      : response.razorpay_signature,
                });
                setConfirmedBooking(apiResponse.data);
                onSuccess?.(apiResponse.data);
            }
        });
    };



    const bookEvent = async (params: InitiateBookingParams) => {
        if (isLoading) return;
        setIsLoading(true);

        const { eventId, eventTitle, selectedQuantity, paymentMethod, userName, userEmail, userPhone } = params;
        console.log('bookEvent Params :', params);

        setIsLoading(true);

        try {
            const validatedData = initiateBookingSchema.parse({
                quantity: selectedQuantity,
                paymentMethod: paymentMethod
            });

            const response: ApiResponse<InitiateBookingResponse> = await bookingServices.initiateBooking(eventId, selectedQuantity, paymentMethod);
            // console.log('response from initiateBooking :', response);
            logger.info("response from initiateBooking :", response);

            if (response.data.paymentMethod === PAYMENT_METHODS.ONLINE) {
                // Open Razorpay passing the order details
                await handleCheckout(response.data.order, eventTitle, userName, userEmail, userPhone);
                return;
            }

            if (response.data.paymentMethod === PAYMENT_METHODS.NONE || response.data.paymentMethod === PAYMENT_METHODS.WALLET) {
                // Free or Wallet — successfully deducted and confirmed by backend via ACID transaction
                setConfirmedBooking(response.data.populatedBooking);
                onSuccess?.(response.data.populatedBooking);
                return;
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




    // Retry for bookings that are stuck in PENDING status
    const retryBookingPayment = async (params: RetryBookingParams) => {
        if (isLoading) return;
        setIsLoading(true);

        const { bookingId, eventTitle, paymentMethod, userName, userEmail, userPhone } = params;

        try {
            const response: ApiResponse<InitiateBookingResponse> = await bookingServices.retryBookingPayment(bookingId, paymentMethod);
            
            logger.info("response from retryPayment :", response);

            if (response.data.paymentMethod === PAYMENT_METHODS.ONLINE) {
                await handleCheckout(response.data.order, eventTitle, userName, userEmail, userPhone);
                return;
            }

            if (response.data.paymentMethod === PAYMENT_METHODS.WALLET) {
                setConfirmedBooking(response.data.populatedBooking);
                onSuccess?.(response.data.populatedBooking);
                return;
            }

        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage === "CANCELLED_BY_USER") {
                logger.info("User closed the payment gateway during retry.");
            } else {
                if (errorMessage) onError?.(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => setConfirmedBooking(null);

    return { 
        bookEvent, 
        retryBookingPayment, 
        isLoading, 
        confirmedBooking, 
        reset 
    };

}