// frontend/src/components/booking/BookingTicket.tsx

import QRCode from "react-qr-code";
import {
  MapPin,
  Globe,
  RefreshCw,
  Plane,
  AlertOctagon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate6 } from "@/utils/dateAndTimeFormats";
import { BOOKING_STATUS, type IBookingState } from "@/types/booking.types";
import { getBookingStatusVariant } from "@/utils/UI.utils";
import { EVENT_FORMATS } from "@/types/event.types";

interface BookingTicketProps {
  booking: IBookingState;
}

export default function BookingTicket({ booking }: BookingTicketProps) {
  const isOnline = booking.event.format === EVENT_FORMATS.ONLINE;
  const isFree = booking.totalAmount === 0;
  const isConfirmed = booking.bookingStatus === BOOKING_STATUS.CONFIRMED;
  const isAttended = booking.bookingStatus === BOOKING_STATUS.ATTENDED;
  const showQR = isConfirmed || isAttended;
  const isCancelled = booking.bookingStatus === BOOKING_STATUS.CANCELLED;

  const ticketNumber = booking.bookingId.slice(-8).toUpperCase();

  return (
    <div
      className={`
        relative max-w-4xl mx-auto 
        bg-(--card-bg) 
        border border-(--border-default) 
        shadow-(--shadow-xl) 
        rounded-xl overflow-hidden
        ${isCancelled ? "opacity-70 grayscale" : ""}
        transition-all duration-200
      `}
    >
      {/* Header strip */}
      <div className="bg-linear-to-r from-(--brand-primary) to-(--brand-primary-dark) px-6 py-4 flex items-center justify-between text-(--text-inverted)">
        <div className="flex items-center gap-3">
          <Plane className="h-6 w-6 opacity-90" />
          <div>
            <div className="font-bold text-lg tracking-wider uppercase">Entry Pass</div>
            <div className="text-xs opacity-80 tracking-wide">
              {booking.event.category || "Event Access"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm opacity-75 uppercase tracking-wider mb-1">
            Ticket #{ticketNumber}
          </div>
          <Badge
            variant={getBookingStatusVariant(booking.bookingStatus)}
            className="text-xs px-2.5 py-0.5"
          >
            {booking.bookingStatus?.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Main ticket content */}
        <div className="flex-1 p-4 md:p-5 border-b md:border-b-0 md:border-r border-dashed border-(--border-muted)">
          {/* Attendee + Price */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-7">
            <div>
              <div className="text-xs uppercase tracking-widest text-(--text-tertiary) mb-1">
                Attendee
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-(--text-primary) tracking-tight">
                {'Mohamed Sajeer M MK'}
                {/* ↑ Ideally: booking.user?.name || "Attendee Name" */}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-xs uppercase tracking-widest text-(--text-tertiary) mb-1">
                Total Price
              </div>
              <div
                className={`
                  text-3xl md:text-4xl font-black tracking-tight
                  ${isFree ? "text-(--status-success)" : "text-(--brand-primary)"}
                `}
              >
                {isFree ? "FREE" : `₹${booking.totalAmount.toLocaleString("en-IN")}`}
              </div>
              {booking.quantity > 1 && !isFree && (
                <div className="text-sm text-(--text-secondary) mt-1">
                  ₹{booking.ticketRate?.toLocaleString("en-IN") || "—"} × {booking.quantity}
                </div>
              )}
            </div>
          </div>

          {/* Key info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-6 md:gap-y-7 mb-8">
            <div className="col-span-2 sm:col-span-2 lg:col-span-3">
              <div className="text-xs uppercase text-(--text-tertiary) tracking-wide mb-1">Event</div>
              <div className="font-bold text-base md:text-lg text-(--text-primary) leading-tight line-clamp-2">
                {booking.event.title}
              </div>
            </div>

            <div className="col-span-1 sm:col-span-1 lg:col-span-1">
              <div className="text-xs uppercase text-(--text-tertiary) tracking-wide mb-1">Admits</div>
              <div className="font-bold text-base md:text-lg mt-0.5">{booking.quantity || 1}</div>
            </div>

            <div className="col-span-1 sm:col-span-1 lg:col-span-1">
              <div className="text-xs uppercase text-(--text-tertiary) tracking-wide mb-1">Type</div>
              <div className="font-bold text-base md:text-lg mt-0.5">
                {isFree ? "FREE" : "PAID"}
              </div>
            </div>

            <div className="col-span-1 sm:col-span-1 lg:col-span-1">
              <div className="text-xs uppercase text-(--text-tertiary) tracking-wide mb-1">Format</div>
              <div className="font-bold text-base md:text-lg mt-0.5">
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-2 lg:col-span-3">
              <div className="text-xs uppercase text-(--text-tertiary) tracking-wide mb-1">Starts</div>
              <div className="font-bold text-base md:text-md text-(--success-text) mt-0.5">
                {formatDate6(booking.event.startDateTime)}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-2 lg:col-span-3">
              <div className="text-xs uppercase text-(--text-tertiary) tracking-wide mb-1">Ends</div>
              <div className="font-bold text-base md:text-md text-(--warning-text) mt-0.5">
                {formatDate6(booking.event.endDateTime)}
              </div>
            </div>
          </div>

          {/* Venue / Online Link */}
          <div className="flex items-center gap-4 bg-(--bg-tertiary) p-5 rounded-lg border border-(--border-muted)">
            {isOnline ? (
              <Globe className="h-6 w-6 text-(--brand-primary) shrink-0" />
            ) : (
              <MapPin className="h-6 w-6 text-(--brand-primary) shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-widest text-(--text-tertiary)">
                {isOnline ? "Boarding Gate (Link)" : "Venue"}
              </div>
              {isOnline ? (
                isConfirmed && booking.event.onlineLink ? (
                  <a
                    href={booking.event.onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-(--brand-primary) hover:underline hover:text-(--brand-primary-hover) break-all"
                  >
                    {booking.event.onlineLink}
                  </a>
                ) : (
                  <div className="text-sm text-(--text-secondary) opacity-80">
                    Link available after confirmation
                  </div>
                )
              ) : (
                <div className="font-semibold text-(--text-primary) truncate">
                  {booking.event.locationName || "To Be Announced"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR / Stub Area */}
        <div className="md:w-80 bg-(--bg-secondary) flex flex-col border-t md:border-t-0">
          <div className="md:hidden bg-(--brand-primary) text-(--text-inverted) px-5 py-3 text-center font-bold uppercase tracking-wider text-sm">
            Passenger Stub
          </div>

          <div className="p-6 md:p-8 flex flex-col items-center justify-center flex-1">
            {showQR && booking.qrToken ? (
              <div className="flex flex-col items-center gap-5 w-full">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-(--border-default)">
                  <QRCode value={booking.qrToken} size={160} style={{ display: "block" }} />
                </div>

                {booking.remainingEntries !== undefined && (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
                    text-xs font-bold uppercase tracking-wide 
                    bg-(--badge-primary-bg) text-(--badge-primary-text) border border-(--badge-primary-border)"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {booking.remainingEntries} Entries Remaining
                  </div>
                )}

                <div className="w-full pt-5 border-t border-(--border-muted) space-y-3 text-left">
                  <div>
                    <div className="text-xs uppercase text-(--text-tertiary)">Ticket No</div>
                    <div className="font-mono font-semibold text-(--text-primary)">{ticketNumber}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-44 h-44 rounded-xl bg-(--card-bg) border-2 border-dashed border-(--border-muted) flex flex-col items-center justify-center gap-3 text-center">
                <AlertOctagon className="h-10 w-10 text-(--text-tertiary)" />
                <span className="text-xs font-bold uppercase tracking-wide text-(--text-tertiary)">
                  {isCancelled ? "VOID" : "QR\nNot Ready"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="bg-(--bg-tertiary) px-6 py-3 text-center text-xs text-(--text-tertiary) border-t border-(--border-muted)">
        Event access subject to terms & conditions • {new Date().getFullYear()}
      </div>
    </div>
  );
}