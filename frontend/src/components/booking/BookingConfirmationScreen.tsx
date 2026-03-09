import { Button } from "@/components/ui/button";
import type { IBookingState } from "@/types/booking.types";
import { Check, CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";


export function BookingConfirmationScreen({ booking, userEmail, onClose}: {
   booking:   IBookingState;
   userEmail: string;
   onClose:   () => void;
}) {
   const [copied, setCopied] = useState(false);
   const navigate = useNavigate();

   const copyToken = async () => {
      await navigator.clipboard.writeText(booking.qrToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleViewBookings = () => {
      onClose(); 
      navigate("/my-bookings");
   };

   return (
      <div className="text-center space-y-6 py-2">

         {/* Success icon */}
         <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-(--badge-success-bg) border border-(--badge-success-border) flex items-center justify-center">
               <CheckCircle size={32} className="text-(--status-success)" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-(--heading-primary)">Booking Confirmed!</h3>
               <p className="text-sm text-(--text-secondary) mt-1">
                  {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""} secured
               </p>
            </div>
         </div>


         {/* 2. Ticket QR Code */}
         <div className="mx-auto w-fit p-4 rounded-2xl bg-(--bg-primary) border border-(--card-border)">
            {/* The white background is crucial for scanners to read it properly */}
            <div className="bg-white p-3 rounded-xl flex items-center justify-center">
               <QRCode 
                  value={booking.qrToken} 
                  size={160} 
                  level="M" // Medium error correction is usually best for JWTs
               />
            </div>
            <p className="text-xs text-(--text-tertiary) mt-4 text-center">Sent to {userEmail}</p>
         </div>

         {/* Copy token */}
         <Button
            onClick={copyToken}
            variant="ghost"
            size="xs"
            className="flex mx-auto text-xs text-(--text-secondary) hover:text-(--text-primary)"
         >
            {copied ? <Check size={13} className="text-(--status-success)" /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy QR token"}
         </Button>

         {/* Booking summary */}
         <div className="text-left rounded-2xl bg-(--bg-tertiary) border border-(--card-border) divide-y divide-(--border-muted) text-sm">
            <div className="flex justify-between px-4 py-3">
               <span className="text-(--text-secondary)">Booking ID</span>
               <span className="font-mono text-(--text-primary) text-xs">{booking.bookingId.slice(-10).toUpperCase()}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
               <span className="text-(--text-secondary)">Amount Paid</span>
               <span className="font-semibold text-(--heading-primary)">
                  {booking.totalAmount === 0 ? "Free" : `₹${booking.totalAmount.toLocaleString("en-IN")}`}
               </span>
            </div>
            <div className="flex justify-between px-4 py-3">
               <span className="text-(--text-secondary)">Booked Tickets</span>
               <span className="font-semibold text-(--heading-primary)">{booking.quantity}</span>
            </div>
         </div>

         <div className="flex flex-1 gap-3 pt-2">
            <Button
               onClick={handleViewBookings}
               variant="default"
               size="lg"
               className="w-full rounded-2xl font-bold text-sm"
            >
               View My Bookings
            </Button>
            
            <Button
               onClick={onClose}
               variant="secondary"
               size="lg"
               className="w-full rounded-2xl font-bold text-sm"
            >
               Close
            </Button>
         </div>
      </div>
   );
}