// backend/src/mappers/booking.mapper.ts

import { BookingEntity, BookingEntityPopulated, ConfirmBookingInput, CreateBookingInput } from "@/entities/booking.entity";
import { BookingResponseDTO } from "@/dtos/booking.dto";
import { BOOKING_STATUS, IBookingModel, IBookingPopulatedUserAndEvent, MapBookingParams, PAYMENT_STATUS } from "@/types/booking.types";
import { Types } from "mongoose";
import { EVENT_FORMAT, TICKET_TYPE } from "@/types/event.types";




// ─── DTO → Input ───────────────────────────────────────────────────────────
export function mapBookingOrderDtoToInput(params: MapBookingParams): CreateBookingInput {

  const { userId, event, newBookingQty, ticketNo, qrToken, paymentOrderId } = params;
  const isFree = event.ticketType === TICKET_TYPE.FREE;

  return {
    userRef: new Types.ObjectId(userId),
    eventRef: new Types.ObjectId(event.id),
    quantity: newBookingQty,
    ticketNo: ticketNo,
    eventFormat: event.format,
    ticketRate: event.ticketPrice,
    totalAmount: event.ticketPrice * newBookingQty,
    bookingStatus: isFree ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.PENDING,
    qrToken: isFree && qrToken ? qrToken : "",  // No QR token for paid events, generated after payment success
    remainingEntries: newBookingQty,
    payment: {
      orderId: isFree ? `free_${userId}_${Date.now()}` : paymentOrderId!,
      status: isFree ? PAYMENT_STATUS.COMPLETED : PAYMENT_STATUS.PENDING,
      ...(isFree && { paidAt: new Date() }),
    },
  };
}

// for paid event booking confirmation
export function mapConfirmBookingInput(
  paymentId: string,
  signature: string,
  qrToken: string
): ConfirmBookingInput {
  return {
    payment: {
      paymentId,
      signature,
      status: PAYMENT_STATUS.COMPLETED,
      paidAt: new Date(),
    },
    qrToken,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
  };
}



// ─── Model → Entity ───────────────────────────────────────────────────────────
function mapBookingBase(model: {
  _id: Types.ObjectId
  userRef: Types.ObjectId
  eventRef: Types.ObjectId
  ticketNo: string
  quantity: number
  ticketRate: number
  totalAmount: number
  bookingStatus: BOOKING_STATUS
  payment: IBookingModel["payment"]
  qrToken: string
  remainingEntries: number
  checkedInAt?: Date
  cancellation?: IBookingModel["cancellation"]
  majorEventChange?: IBookingModel["majorEventChange"]
  refundGracePeriodEnd?: Date | null
  createdAt: Date
  updatedAt: Date
}): BookingEntity {
  return {
    bookingId: model._id.toString(),
    userRef: model.userRef.toString(),
    eventRef: model.eventRef.toString(),
    ticketNo: model.ticketNo,
    quantity: model.quantity,
    ticketRate: model.ticketRate,
    totalAmount: model.totalAmount,
    bookingStatus: model.bookingStatus,
    payment: model.payment,
    qrToken: model.qrToken,
    remainingEntries: model.remainingEntries,
    checkedInAt: model.checkedInAt,
    cancellation: model.cancellation,
    majorEventChange: model.majorEventChange,
    refundGracePeriodEnd: model.refundGracePeriodEnd,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}


export function mapBookingModelToEntity(
  model: IBookingModel
): BookingEntity {
  return mapBookingBase(model);
}


// ─── Populated Model → Populated Entity ──────────────────────────────────────
export function mapPopulatedBookingModelToEntity(
  model: IBookingPopulatedUserAndEvent
): BookingEntityPopulated {

  const base = mapBookingBase({
    ...model,
    userRef: model.userRef._id,
    eventRef: model.eventRef._id,
  });

  const { eventRef, userRef, ...rest } = base;

  return {
    ...rest,
    event: {
      eventId: model.eventRef._id.toString(),
      title: model.eventRef.title,
      category: model.eventRef.category,
      posterUrl: model.eventRef.posterUrl,
      startDateTime: model.eventRef.startDateTime,
      endDateTime: model.eventRef.endDateTime,
      format: model.eventRef.format,
      locationName: model.eventRef.locationName,
      onlineLink: model.eventRef.onlineLink,
    },
    user: {
      userId: model.userRef._id.toString(),
      name: model.userRef.name,
      email: model.userRef.email,
    }
  };
}

// ─── Populated Entity → Response DTO ─────────────────────────────────────────
// Used in service layer — converts entity to the shape the frontend receives.

export function mapBookingEntityToResponseDTO(
  entity: BookingEntityPopulated
): BookingResponseDTO {
  return {
    bookingId: entity.bookingId,
    event: {
      eventId:       entity.event.eventId,
      title:         entity.event.title,
      category:      entity.event.category,
      posterUrl:     entity.event.posterUrl,
      startDateTime: entity.event.startDateTime.toISOString(),
      endDateTime:   entity.event.endDateTime.toISOString(),
      format:        entity.event.format,
      locationName:  entity.event.locationName,
      onlineLink:    entity.event.onlineLink,
    },
    user: {
      userId: entity.user.userId,
      name: entity.user.name,
      email: entity.user.email,
    },
    ticketNo:         entity.ticketNo,
    quantity:         entity.quantity,
    ticketRate:       entity.ticketRate,
    totalAmount:      entity.totalAmount,
    bookingStatus:    entity.bookingStatus,
    payment: {
      orderId:   entity.payment.orderId,
      paymentId: entity.payment.paymentId,
      signature: entity.payment.signature,
      status:            entity.payment.status,
      paidAt:            entity.payment.paidAt?.toISOString(),
    },
    qrToken:          entity.qrToken,
    remainingEntries: entity.remainingEntries,
    checkedInAt:      entity.checkedInAt?.toISOString(),
    cancellation: entity.cancellation
      ? {
          reason:      entity.cancellation.reason,
          cancelledAt: entity.cancellation.cancelledAt.toISOString(),
          refundId:    entity.cancellation.refundId,
          refundedAt:  entity.cancellation.refundedAt?.toISOString(),
        }
      : undefined,
    refundGracePeriodEnd: entity.refundGracePeriodEnd?.toISOString(),
    createdAt: entity.createdAt.toISOString(),
  };
}