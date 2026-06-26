// frontend/src/components/booking/BookingModal.tsx
import { useEffect, useMemo, useState } from "react";
import {
  X, Ticket, Minus, Plus, Calendar, MapPin, Globe,
  AlertCircle,
} from "lucide-react";
import { useBooking } from "@/hooks/useBooking";
import { toast } from "react-toastify";
import { type IBookingState } from "@/types/booking.types";
import type { UserState } from "@/types/user.types";
import { type IEventState } from "@/types/event.types";
import { formatDate3 } from "@/utils/dateAndTimeFormats";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { BookingConfirmationScreen } from "@/components/booking/BookingConfirmationScreen";
import { getMaxBookingQuantity } from "@/utils/booking.utils";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { Button } from "@/components/ui/button";
import { BOOKING_CONSTRAINTS } from "@/constants/booking.constants";
import { PAYMENT_METHODS, type PaymentMethod } from "@/constants/payment.constants";
import { EVENT_FORMATS, TICKET_TYPES, type EventFormat } from "@/constants/event.constants";


type EmbeddedEventSnapshot = IBookingState["event"];


interface BookingModalProps {
   event       : IEventState | EmbeddedEventSnapshot;
   user        : UserState;
   isOpen      : boolean;
   onClose     : () => void;
   onBooked?   : (populatedBooking: IBookingState) => void;
   retryBooking?: IBookingState;
}




export function BookingModal({ event, user, isOpen, onClose, onBooked, retryBooking }: BookingModalProps) {
   const fullEvent = event as Partial<IEventState>;
   const isOnlineEvent: boolean  = event.format === EVENT_FORMATS.ONLINE;
   const ticketPrice: number = fullEvent.ticketPrice || 0;

   const isFree: boolean = retryBooking 
      ? retryBooking.totalAmount === 0 
      : fullEvent.ticketType === TICKET_TYPES.FREE;

   // If retrying, pretend we have exactly the right amount of tickets left
   const ticketsLeft: number = retryBooking 
      ? retryBooking.quantity 
      : (fullEvent.capacity || 0) - (fullEvent.soldTickets || 0);

   // If retrying, lock the max quantity to the retry quantity so the useEffect doesn't crash the state
   const maxBookingQty: number = retryBooking
      ? retryBooking.quantity
      : getMaxBookingQuantity(event.format as EventFormat, ticketsLeft);

   console.log('fullEvent.capacity :', fullEvent.capacity)
   console.log('fullEvent.soldTickets :', fullEvent.soldTickets)
   console.log('ticketsLeft :', ticketsLeft)

   const [step, setStep]                           = useState<1 | 2>(1);
   const [selectedQuantity, setSelectedQuantity]   = useState(1);
   const [error, setError]                         = useState<string | null>(null);
   const [paymentMethod, setPaymentMethod]         = useState<PaymentMethod>(isFree ? PAYMENT_METHODS.NONE : PAYMENT_METHODS.ONLINE);



   const totalPrice = useMemo(
      () => {
         if (retryBooking) return retryBooking.totalAmount;
         return isFree ? 0 : ticketPrice * selectedQuantity;
      },
      [isFree, ticketPrice, selectedQuantity, retryBooking]
   );
   
   const hasSufficientWalletBalance = user.walletBalance ? user.walletBalance >= totalPrice : false;

   const constraintMessage = event.format === EVENT_FORMATS.ONLINE
      ? BOOKING_CONSTRAINTS.ONLINE.MESSAGE
      : BOOKING_CONSTRAINTS.OFFLINE.MESSAGE;

   const { bookEvent, retryBookingPayment, isLoading, confirmedBooking, reset } = useBooking({
      onSuccess: (populatedBooking) => {
         onBooked?.(populatedBooking);
         // pass the success message from backend if available, else show generic success message
         toast.success("Booking confirmed! Check your email for the Ticket / QR code.");
      },
      onError: (errorMessage) => {
         if (errorMessage){
            toast.error(errorMessage);
            setError(errorMessage);
         }
      },
   });


   // Auto-switch payment method if wallet becomes insufficient after increasing quantity
   useEffect(() => {
      if (paymentMethod === PAYMENT_METHODS.WALLET && !hasSufficientWalletBalance) {
          setPaymentMethod(PAYMENT_METHODS.ONLINE);
      }
   }, [totalPrice, hasSufficientWalletBalance, paymentMethod]);


   useEffect(() => {
      if (selectedQuantity > maxBookingQty) {
         setSelectedQuantity(maxBookingQty > 0 ? 1 : 0);
      }
   }, [maxBookingQty]);


   // prevent background scroll AND set initial step
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";

         // If retrying, skip Step 1 and jump straight to the Payment Summary
         if (retryBooking) {
            setStep(2);
            setSelectedQuantity(retryBooking.quantity);
         } else {
            setStep(1);
            setSelectedQuantity(1);
         }
      } else {
         document.body.style.overflow = "";
      }

      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen, retryBooking]);


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
      
      // retry Payment for Pending Booking
      if (retryBooking) {
         retryBookingPayment({
            bookingId     : retryBooking.bookingId,
            paymentMethod : paymentMethod,
            eventTitle    : event.title,
            userName      : user.name,
            userEmail     : user.email,
            userPhone     : user.mobile || "",
         });
         return;
      }

      // New Booking
      bookEvent({
         eventId          : event.eventId,
         eventTitle       : event.title,
         selectedQuantity : selectedQuantity,
         paymentMethod    : paymentMethod,
         userName         : user.name,
         userEmail        : user.email,
         userPhone        : user.mobile || "",
      });
   };


   if (!isOpen) return null;


   return (
      // Overlay — flex-col on mobile (bottom sheet), centered on sm+
      <div className="fixed inset-0 z-1000 flex flex-col items-stretch sm:items-center sm:justify-center sm:p-4">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
         />

         {/* Spacer — pushes sheet to bottom on mobile */}
         <div className="flex-1 sm:hidden" onClick={handleClose} />

         {/* Modal sheet */}
         <div
            className={[
               // base
               "relative w-full bg-(--card-bg) border border-(--card-border) shadow-2xl",
               "flex flex-col",
               // mobile: bottom sheet, max 90dvh so it never overflows
               "rounded-t-3xl max-h-[90dvh]",
               // sm+: centered card, capped width & height
               "sm:rounded-3xl sm:max-w-md sm:max-h-[88vh]",
            ].join(" ")}
         >
            {/* ── Header ─────────────────────────────────────────── */}
            {/* shrink-0 prevents header from collapsing when content is tall */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-(--card-border) shrink-0">
               <div className="flex items-center gap-2">
                  <Ticket size={18} className="text-(--brand-primary)" />
                  <h2 className="font-bold text-(--heading-primary) text-base">
                     {confirmedBooking ? "Booking Confirmed" : "Book Tickets"}
                  </h2>
               </div>
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-full h-8 w-8"
               >
                  <X size={16} />
               </Button>
            </div>

            {/* ── Body — scrollable ───────────────────────────────── */}
            {/* flex-1 + overflow-y-auto: body grows and scrolls, header/footer stay fixed */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
               {/* Loading overlay */}
               {isLoading && step === 2 ? (
                  <div className="flex items-center justify-center min-h-50">
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

                     {/* ── Step 1 — ticket selector ─────────────── */}
                     {step === 1 && (
                        <div className="space-y-4 mt-1">
                           {/* Event summary */}
                           <div className="flex gap-3 p-3 rounded-2xl bg-(--bg-tertiary) border border-(--card-border)">
                              <img
                                 src={event.posterUrl}
                                 alt={event.title}
                                 className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
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
                                    {isOnlineEvent ? (
                                       <><Globe size={11} /> Online event</>
                                    ) : (
                                       <><MapPin size={11} /> {event.locationName}</>
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
                                    ? `Only ${ticketsLeft} left`
                                    : `${ticketsLeft} tickets left`}
                              </span>
                           </div>

                           {/* Quantity selector */}
                           {isOnlineEvent ? (
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
                                       className="rounded-full w-10 h-10 shrink-0"
                                    >
                                       <Minus size={16} />
                                    </Button>
                                    <span className="w-8 text-center text-xl font-bold text-(--heading-primary)">
                                       {selectedQuantity}
                                    </span>
                                    <Button
                                       variant="secondary"
                                       size="icon"
                                       onClick={() => setSelectedQuantity((q) => Math.min(maxBookingQty, q + 1))}
                                       disabled={selectedQuantity >= maxBookingQty}
                                       className="rounded-full w-10 h-10 shrink-0"
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
                                 <span>{isFree ? "Free" : `₹${ticketPrice.toLocaleString("en-IN")}`}</span>
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

                     {/* ── Step 2 — review & confirm ────────────── */}
                     {step === 2 && (
                        <div className="space-y-4 mt-1">
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

                           {/* Order Summary */}
                           <h3 className="font-semibold text-(--heading-primary)">Order Summary</h3>
                           <div className="rounded-2xl bg-(--bg-tertiary) border border-(--card-border) divide-y divide-(--border-muted) text-sm">
                              <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                                 <span>Event</span>
                                 <span className="font-medium text-(--heading-primary) text-right max-w-[55%] truncate">
                                    {event.title}
                                 </span>
                              </div>
                              <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                                 <span>Date & Time</span>
                                 <span>{formatDate3(event.startDateTime)}</span>
                              </div>
                              <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                                 <span>Tickets</span>
                                 <span>
                                    {selectedQuantity} ×{" "}
                                    {isFree ? "Free" : `₹${ticketPrice.toLocaleString("en-IN")}`}
                                 </span>
                              </div>
                              <div className="flex justify-between px-4 py-3 font-bold text-(--heading-primary)">
                                 <span>Total payable</span>
                                 <span>{isFree ? "₹0" : `₹${totalPrice.toLocaleString("en-IN")}`}</span>
                              </div>
                           </div>

                           {/* ── Payment Method Selector (Only for Paid Events) ── */}
                           {!isFree && (
                              <div className="space-y-3 mt-5">
                                 <h3 className="font-semibold text-sm text-(--text-tertiary) uppercase tracking-wide">
                                    Select Payment Method
                                 </h3>
                                 
                                 {/* Option 1: Pay Online */}
                                 <div 
                                    role="radio"
                                    aria-checked={paymentMethod === PAYMENT_METHODS.ONLINE}
                                    onClick={() => setPaymentMethod(PAYMENT_METHODS.ONLINE)}
                                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                                       paymentMethod === PAYMENT_METHODS.ONLINE 
                                          ? 'border-(--brand-primary) bg-(--brand-primary)/5' 
                                          : 'border-(--card-border) bg-(--bg-secondary)'
                                    }`}
                                 >
                                    {/* Radio Icon (Pinned to top) */}
                                    <div className={`mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                                       paymentMethod === PAYMENT_METHODS.ONLINE ? 'border-(--brand-primary)' : 'border-(--text-tertiary)'
                                    }`}>
                                       {paymentMethod === PAYMENT_METHODS.ONLINE && (
                                          <div className="w-2 h-2 rounded-full bg-(--brand-primary)" />
                                       )}
                                    </div>
                                    
                                    {/* Content Stacked */}
                                    <div className="ml-3 flex flex-col gap-3 w-full">
                                       <span className="text-sm font-medium text-(--heading-primary) leading-none mt-0.5">
                                          Pay Online (Cards, UPI, NetBanking)
                                       </span>
                                       
                                       {/* Trust Icons Below Text */}
                                       <div className="flex items-center gap-2.5">
                                          <img 
                                             src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" 
                                             alt="UPI" 
                                             className="h-4 w-auto object-contain opacity-80 mix-blend-multiply dark:mix-blend-normal"
                                          />
                                          <img 
                                             src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" 
                                             alt="GPay" 
                                             className="h-4 w-auto object-contain opacity-80 mix-blend-multiply"
                                          />
                                          <img 
                                             src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg" 
                                             alt="Visa" 
                                             className="h-3.5 w-auto object-contain opacity-80"
                                          />
                                          <img 
                                             src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                                             alt="Mastercard" 
                                             className="h-5 w-auto object-contain opacity-80"
                                          />
                                       </div>
                                    </div>
                                 </div>

                                 {/* Option 2: Pay via Wallet */}
                                 <div 
                                    role="radio"
                                    aria-checked={paymentMethod === PAYMENT_METHODS.WALLET}
                                    aria-disabled={!hasSufficientWalletBalance}
                                    onClick={() => {
                                       if (hasSufficientWalletBalance) {
                                          setPaymentMethod(PAYMENT_METHODS.WALLET);
                                       }
                                    }}
                                    className={`flex items-start p-4 rounded-xl border transition-all ${
                                       !hasSufficientWalletBalance 
                                          ? 'opacity-60 cursor-not-allowed border-(--card-border) bg-(--bg-tertiary)' 
                                          : 'cursor-pointer ' + (
                                             paymentMethod === PAYMENT_METHODS.WALLET 
                                                ? 'border-(--brand-primary) bg-(--brand-primary)/5' 
                                                : 'border-(--card-border) bg-(--bg-secondary)'
                                          )
                                    }`}
                                 >
                                    {/* Radio Icon (Pinned to top) */}
                                    <div className={`mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                                       paymentMethod === PAYMENT_METHODS.WALLET ? 'border-(--brand-primary)' : 'border-(--text-tertiary)'
                                    }`}>
                                       {paymentMethod === PAYMENT_METHODS.WALLET && (
                                          <div className="w-2 h-2 rounded-full bg-(--brand-primary)" />
                                       )}
                                    </div>
                                    
                                    {/* Content Stacked */}
                                    <div className="ml-3 flex flex-col gap-3 w-full">
                                       <div className="flex flex-col gap-1">
                                          <span className="text-sm font-medium text-(--heading-primary) leading-none mt-0.5">
                                             Pay via Wallet
                                          </span>
                                          <span className="text-xs text-(--text-secondary)">
                                             Available Balance: ₹{user.walletBalance?.toLocaleString("en-IN") || 0}
                                          </span>
                                       </div>

                                       {/* Wallet Icon Below Text */}
                                       <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-2">
                                             <div className="flex items-center justify-center h-5 w-5 rounded shadow-sm opacity-90">
                                                <img 
                                                   src="/logos/crowdconnect-logo-1.png" 
                                                   alt="CrowdConnect Wallet" 
                                                   className="h-6 w-6 object-contain"
                                                />
                                             </div>
                                             <span className="text-xs font-medium text-(--text-tertiary)">
                                                CrowdConnect Wallet
                                             </span>
                                          </div>

                                          {!hasSufficientWalletBalance && (
                                             <span className="text-[10px] uppercase tracking-wider font-bold text-(--status-error) bg-(--badge-error-bg) px-2 py-1 rounded border border-(--badge-error-border)">
                                                Insufficient
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* Attendee Details*/}
                           <div className="rounded-2xl bg-(--bg-tertiary) border border-(--card-border) divide-y divide-(--border-muted) text-sm">
                              <div className="px-4 py-2 text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide">
                                 Booking for
                              </div>
                              <div className="flex justify-between px-4 py-3 text-(--text-secondary)">
                                 <span>Name</span>
                                 <span className="text-(--text-primary)">{user.name}</span>
                              </div>
                              <div className="flex justify-between items-center px-4 py-3 text-(--text-secondary)">
                                 <span>Email</span>
                                 <span className="text-(--text-primary) text-xs truncate max-w-[55%]">{user.email}</span>
                              </div>
                           </div>

                           <p className="text-xs text-(--text-tertiary) text-center leading-relaxed pb-1">
                              By confirming, you agree to CrowdConnect's booking policy.
                              {!isFree && " Cancellations accepted up to 24 hours before the event."}
                           </p>
                        </div>
                     )}
                  </>
               )}
            </div>

            {/* ── Footer — always visible, never scrolls away ─────── */}
            {/* shrink-0 keeps footer pinned even when body content is tall */}
            {!isLoading && !confirmedBooking && (
               <div className="shrink-0 px-5 pb-6 pt-3 border-t border-(--card-border)">
                  {step === 1 && (
                     <div className="flex gap-3">
                        <Button
                           variant="secondary"
                           onClick={handleClose}
                           className="flex-1 h-11"
                        >
                           Cancel
                        </Button>
                        <Button
                           variant="default"
                           onClick={handleContinue}
                           disabled={ticketsLeft <= 0}
                           className="flex-1 h-11"
                        >
                           Continue
                        </Button>
                     </div>
                  )}
                  {step === 2 && (
                     <div className="flex gap-3">
                        {/* ONLY show the Back button if this is a NEW booking */}
                        {!retryBooking && (
                           <Button
                              variant="secondary"
                              onClick={() => { setStep(1); setError(null); }}
                              className="flex-1 h-11"
                           >
                              Back
                           </Button>
                        )}
                        <Button
                           variant="default"
                           onClick={handleConfirm}
                           className={`h-11 ${retryBooking ? "w-full" : "flex-1"}`}
                        >
                           {isFree ? "Confirm Booking" : `Pay ₹${totalPrice.toLocaleString("en-IN")}`}
                        </Button>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}