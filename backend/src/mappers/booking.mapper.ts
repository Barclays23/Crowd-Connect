// backend/src/mappers/booking.mapper.ts

import { BookingEntity, BookingEntityPopulated, CreateBookingInput } from "@/entities/booking.entity";
import { BookingResponseDTO } from "@/dtos/booking.dto";
import { BOOKING_STATUS, IBookingModel, IBookingPopulatedUserAndEvent, PAYMENT_STATUS } from "@/types/booking.types";
import { EventEntity } from "@/entities/event.entity";
import { Types } from "mongoose";
import { EVENT_FORMAT } from "@/types/event.types";




// ─── DTO → Input ───────────────────────────────────────────────────────────
export function mapBookingOrderDtoToInput(
  userId: string,
  event: EventEntity,
  newBookingQty: number,
  ticketNo: string,
  eventFormat: EVENT_FORMAT,
  qrToken: string,
  paymentOrderId: string = `free_${userId}_${Date.now()}`,
  paymentStatus: PAYMENT_STATUS = PAYMENT_STATUS.PAID,
  bookingStatus: BOOKING_STATUS = BOOKING_STATUS.CONFIRMED
): CreateBookingInput {

  return {
    userRef: new Types.ObjectId(userId),
    eventRef: new Types.ObjectId(event.id),
    quantity: newBookingQty,
    ticketNo: ticketNo,
    eventFormat: eventFormat,
    ticketRate: event.ticketPrice,
    totalAmount: event.ticketPrice * newBookingQty,
    bookingStatus,
    payment: {
      razorpayOrderId: paymentOrderId,
      status: paymentStatus,
      paidAt: new Date(),
    },
    qrToken,
    remainingEntries: newBookingQty,
  };
}



// ─── Model → Entity ───────────────────────────────────────────────────────────
// Used in repository layer — converts raw Mongoose document to clean entity.

export function mapBookingModelToEntity(model: IBookingModel): BookingEntity {
  return {
    bookingId:    model._id.toString(),
    userRef:      model.userRef.toString(),
    eventRef:     model.eventRef.toString(),

    ticketNo:    model.ticketNo,
    quantity:    model.quantity,
    ticketRate:  model.ticketRate,
    totalAmount: model.totalAmount,

    eventFormat:   model.eventFormat,
    bookingStatus: model.bookingStatus,

    payment: {
      razorpayOrderId:    model.payment.razorpayOrderId,
      razorpayPaymentId:  model.payment.razorpayPaymentId,
      razorpaySignature:  model.payment.razorpaySignature,
      status:             model.payment.status,
      paidAt:             model.payment.paidAt,
    },

    qrToken:          model.qrToken,
    remainingEntries: model.remainingEntries,
    checkedInAt:      model.checkedInAt,

    cancellation: model.cancellation
      ? {
          reason:      model.cancellation.reason,
          cancelledAt: model.cancellation.cancelledAt,
          refundId:    model.cancellation.refundId,
          refundedAt:  model.cancellation.refundedAt,
        }
      : undefined,

    majorEventChange: model.majorEventChange
      ? {
          changedAt:  model.majorEventChange.changedAt,
          changeType: model.majorEventChange.changeType,
          summary:    model.majorEventChange.summary,
        }
      : undefined,

    refundGracePeriodEnd: model.refundGracePeriodEnd,

    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

// ─── Populated Model → Populated Entity ──────────────────────────────────────
// Used when eventRef is populated — converts to BookingEntityPopulated.

export function mapPopulatedBookingModelToEntity(
  model: IBookingPopulatedUserAndEvent
): BookingEntityPopulated {
  const base = mapBookingModelToEntity(model as unknown as IBookingModel);
  const { eventRef: _, ...rest } = base;

  return {
    ...rest,
    event: {
      eventId:       model.eventRef._id.toString(),
      title:         model.eventRef.title,
      category:      model.eventRef.category,
      posterUrl:     model.eventRef.posterUrl,
      startDateTime: model.eventRef.startDateTime,
      endDateTime:   model.eventRef.endDateTime,
      format:        model.eventRef.format,
      locationName:  model.eventRef.locationName,
      onlineLink:    model.eventRef.onlineLink,
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
  console.log('entity ::', entity)
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
    eventFormat:      entity.eventFormat,
    bookingStatus:    entity.bookingStatus,
    payment: {
      razorpayOrderId:   entity.payment.razorpayOrderId,
      razorpayPaymentId: entity.payment.razorpayPaymentId,
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