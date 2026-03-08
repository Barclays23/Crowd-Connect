// frontend/src/components/booking/BookingModal.tsx
import { useEffect, useMemo, useState } from "react";
import {
  X, Ticket, Minus, Plus, Calendar, MapPin, Globe,
  AlertCircle,
} from "lucide-react";
import { useBooking } from "@/hooks/useBooking";
import { toast } from "react-toastify";
import { BOOKING_CONSTRAINTS, type IBookingState } from "@/types/booking.types";
import type { UserState } from "@/types/user.types";
import { EVENT_FORMATS, TICKET_TYPES, type IEventState } from "@/types/event.types";
import { formatDate3 } from "@/utils/dateAndTimeFormats";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { BookingConfirmationScreen } from "@/components/booking/BookingConfirmationScreen";
import { getMaxBookingQuantity } from "@/utils/booking.utils";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { Button } from "@/components/ui/button";

interface BookingModalProps {
   event: IEventState;
   user: UserState;
   isOpen: boolean;
   onClose: () => void;
   onBooked?: (populatedBooking: IBookingState) => void;
}



export function BookingModal({ event, user, isOpen, onClose, onBooked }: BookingModalProps) {
   const isOnline = event.format === EVENT_FORMATS.ONLINE;
   const isFree = event.ticketType === TICKET_TYPES.FREE;
   const ticketsLeft = event.capacity - (event.soldTickets ?? 0);
   const maxBookingQty = getMaxBookingQuantity(event.format, ticketsLeft);

   const [step, setStep] = useState<1 | 2>(1);
   const [selectedQuantity, setSelectedQuantity] = useState(1);
   const [error, setError] = useState<string | null>(null);

   const totalPrice = useMemo(
      () => (isFree ? 0 : event.ticketPrice * selectedQuantity),
      [isFree, event.ticketPrice, selectedQuantity]
   );

   const constraintMessage = event.format === EVENT_FORMATS.ONLINE 
      ? BOOKING_CONSTRAINTS.ONLINE.MESSAGE
      : BOOKING_CONSTRAINTS.OFFLINE.MESSAGE;

   const { 
      bookEvent, 
      isLoading, 
      confirmedBooking, 
      reset 
   } = useBooking({
      onSuccess: (populatedBooking) => {
         onBooked?.(populatedBooking);
         toast.success("Booking confirmed! Check your email for the Ticket / QR code.");
      },
      onError: (msg) => {
         console.log('error in BookingModal :', msg)
         toast.error(msg);
         setError(msg);
      },
   });

   useEffect(() => {
      if (selectedQuantity > maxBookingQty) {
         setSelectedQuantity(maxBookingQty > 0 ? 1 : 0);
      }
   }, [maxBookingQty]);

   // prevent background scroll
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }
      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   const handleClose = () => {
      if (isLoading) return;
      setStep(1);
      setSelectedQuantity(1);
      setError(null);
      reset();
      onClose();
   };

   const handleContinue = () => {
      if (ticketsLeft <= 0) return;
      if (selectedQuantity > maxBookingQty) {
         toast.error(`Maximum ${maxBookingQty} tickets per booking`);
         return;
      }
      setStep(2);
   };

   const handleConfirm = () => {
      setError(null);
      bookEvent({
         eventId: event.eventId,
         eventTitle: event.title,
         selectedQuantity: selectedQuantity,
         userName: user.name,
         userEmail: user.email,
         userPhone: user.mobile || "",
      });
   };

   if (!isOpen) return null;

   
   return (
      <div className="fixed inset-0 z-1000 flex items-end sm:items-center justify-center p-0 sm:p-4">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

         {/* Modal */}
         <div className="relative w-full sm:max-w-md bg-(--card-bg) sm:rounded-3xl rounded-t-3xl shadow-2xl border border-(--card-border) flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--card-border) shrink-0">
               <div className="flex items-center gap-2">
                  <Ticket size={18} className="text-(--brand-primary)" />
                  <h2 className="font-bold text-(--heading-primary)">
                  {confirmedBooking ? "Booking Confirmed" : "Book Tickets"}
                  </h2>
               </div>
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-full"
               >
                  <X size={18} />
               </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 relative min-h-75">
               {/* Show loading spinner when processing step 2 */}
               {isLoading && step === 2 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-(--card-bg)/80 backdrop-blur-sm z-20">
                  <LoadingSpinner1
                     message="Processing your booking..."
                     subMessage="Please don't close this window"
                     size="md"
                  />
                  </div>
               ) : confirmedBooking ? (
                  <BookingConfirmationScreen
                  booking={confirmedBooking}
                  userEmail={user.email}
                  onClose={handleClose}
                  />
               ) : (
                  <>
                  <BookingSteps step={step} />

                  {/* Step 1 — ticket selector */}
                  {step === 1 && (
                     <div className="space-y-5">
                        {/* Event summary */}
                        <div className="flex gap-3 p-3 rounded-2xl bg-(--bg-tertiary) border border-(--card-border)">
                        <img
                           src={event.posterUrl}
                           alt={event.title}
                           className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                           <p className="font-semibold text-(--heading-primary) truncate text-sm">
                              {event.title}
                           </p>
                           <p className="text-xs text-(--text-secondary) mt-1 flex items-center gap-1">
                              <Calendar size={11} />
                              {formatDate3(event.startDateTime)}
                           </p>
                           <p className="text-xs text-(--text-secondary) mt-0.5 flex items-center gap-1">
                              {isOnline ? (
                              <>
                                 <Globe size={11} /> Online event
                              </>
                              ) : (
                              <>
                                 <MapPin size={11} /> {event.locationName}
                              </>
                              )}
                           </p>
                        </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center justify-between text-sm">
                        <span className="text-(--text-secondary)">Availability</span>

                        <span
                           className={`font-semibold ${
                              ticketsLeft <= 5
                              ? "text-(--badge-error-text)"
                              : ticketsLeft <= 10
                              ? "text-(--badge-warning-text)"
                              : "text-(--status-success)"
                           }`}
                        >
                           {ticketsLeft <= 0
                              ? "Sold out"
                              : ticketsLeft <= 5
                              ? `Only ${ticketsLeft} tickets remaining`
                              : `${ticketsLeft} tickets left`}
                        </span>
                        </div>

                        {/* Quantity selector */}
                        {isOnline ? (
                           <div className="p-3 rounded-xl bg-(--badge-info-bg) border border-(--badge-info-border) text-sm text-(--badge-info-text)">
                              {constraintMessage}
                           </div>
                        ) : (
                           <div>
                              <p className="text-sm font-medium text-(--text-primary) mb-3">
                                 Number of Tickets
                              </p>

                              <div className="flex items-center gap-4">
                                 <Button
                                 variant="secondary"
                                 size="icon"
                                 onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                                 disabled={selectedQuantity <= 1}
                                 className="rounded-full w-10 h-10"
                                 >
                                 <Minus size={16} />
                                 </Button>

                                 <span className="w-8 text-center text-xl font-bold text-(--heading-primary)">
                                 {selectedQuantity}
                                 </span>

                                 <Button
                                 variant="secondary"
                                 size="icon"
                                 onClick={() =>
                                    setSelectedQuantity((q) => Math.min(maxBookingQty, q + 1))
                                 }
                                 disabled={selectedQuantity >= maxBookingQty}
                                 className="rounded-full w-10 h-10"
                                 >
                                 <Plus size={16} />
                                 </Button>
                              </div>

                              <p className="text-xs text-(--text-tertiary) mt-3">
                                 <span className="text-(--brand-primary)">*</span> {constraintMessage}
                              </p>
                           </div>
                        )}

                        {/* Price breakdown */}
                        <div className="rounded-2xl bg-(--bg-tertiary) border border-(--card-border) divide-y divide-(--border-muted) text-sm">
                           <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                              <span>Price per ticket</span>
                              <span>
                                 {isFree ? "Free" : `₹${event.ticketPrice.toLocaleString("en-IN")}`}
                              </span>
                           </div>
                           <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                              <span>Quantity</span>
                              <span>× {selectedQuantity}</span>
                           </div>
                           <div className="flex justify-between px-4 py-3 font-bold text-(--heading-primary)">
                              <span>Total</span>
                              <span>{isFree ? "Free" : `₹${totalPrice.toLocaleString("en-IN")}`}</span>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Step 2 — review & confirm */}
                  {step === 2 && (
                     <div className="space-y-5">
                        {/* Error */}
                        {error && (
                           <div
                              role="alert"
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-(--badge-error-bg) border border-(--badge-error-border) text-sm text-(--badge-error-text)"
                           >
                              <AlertCircle size={16} className="shrink-0 mt-0.5" />
                              <span>{error}</span>
                           </div>
                        )}
                        <h3 className="font-semibold text-(--heading-primary)">Order Summary</h3>

                        <div className="rounded-2xl bg-(--bg-tertiary) border border-(--card-border) divide-y divide-(--border-muted) text-sm">
                           <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                              <span>Event</span>
                              <span className="font-medium text-(--heading-primary) text-right max-w-[55%] truncate">
                                 {event.title}
                              </span>
                           </div>
                           <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                              <span>Start Date & Time</span>
                              <span>{formatDate3(event.startDateTime)}</span>
                           </div>
                           <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                              <span>Tickets</span>
                              <span>
                                 {selectedQuantity} ×{" "}
                                 {isFree ? "Free" : `₹${event.ticketPrice.toLocaleString("en-IN")}`}
                              </span>
                           </div>
                           <div className="flex justify-between px-4 py-3 font-bold text-(--heading-primary)">
                              <span>Total payable</span>
                              <span>{isFree ? "₹0" : `₹${totalPrice.toLocaleString("en-IN")}`}</span>
                           </div>
                        </div>

                        {/* Attendee */}
                        <div className="rounded-2xl bg-(--bg-tertiary) border border-(--card-border) divide-y divide-(--border-muted) text-sm">
                           <div className="px-4 py-2 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide">
                              Booking for
                           </div>
                           <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                              <span>Name</span>
                              <span className="text-(--text-primary)">{user.name}</span>
                           </div>
                           <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                              <span>Email</span>
                              <span className="text-(--text-primary) text-xs">{user.email}</span>
                           </div>
                        </div>

                        <p className="text-xs text-(--text-tertiary) text-center leading-relaxed">
                           By confirming, you agree to CrowdConnect's booking policy.
                           {!isFree && " Cancellations accepted up to 24 hours before the event."}
                        </p>
                     </div>
                  )}
                  </>
               )}
            </div>

            {/* Footer - only show when not loading and not confirmed */}
            {!isLoading && !confirmedBooking && (
               <div className="px-6 pb-6 pt-3 border-t border-(--card-border) flex gap-3 shrink-0">
                  {step === 1 && (
                  <>
                     <Button
                        variant="secondary"
                        onClick={handleClose}
                        className="flex-1 py-3"
                     >
                        Cancel
                     </Button>
                     <Button
                        variant="default"
                        onClick={handleContinue}
                        disabled={ticketsLeft <= 0}
                        className="flex-1 py-3"
                     >
                        Continue
                     </Button>
                  </>
                  )}
                  {step === 2 && (
                  <>
                     <Button
                        variant="secondary"
                        onClick={() => {
                        setStep(1);
                        setError(null);
                        }}
                        className="flex-1 py-3"
                     >
                        Back
                     </Button>
                     <Button
                        variant="default"
                        onClick={handleConfirm}
                        className="flex-1 py-3"
                     >
                        {isFree ? "Confirm Booking" : `Pay ₹${totalPrice.toLocaleString("en-IN")}`}
                     </Button>
                  </>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}