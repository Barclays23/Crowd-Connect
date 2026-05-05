// backend/src/types/payment.types.ts


export interface CreateOrderResult {
  orderId:  string;
  amount:   number;   // paise
  currency: string;
}



export interface RefundResult {
  refundId: string;  // Razorpay refund ID — stored in booking.cancellation.refundId
  amount:   number;  // Refunded amount in paise
  status:   "pending" | "processed" | "failed";
}