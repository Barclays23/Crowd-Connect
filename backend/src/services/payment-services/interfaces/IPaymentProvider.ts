// src/services/payment-services/interfaces/IPaymentProvider.ts

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


export interface IPaymentProvider {
  createOrder(purpose: string, amount: number, currency: string, userId: string): Promise<CreateOrderResult>;
  verifySignature(orderId: string, paymentId: string, signature: string): boolean;
  initiateRefund(paymentId: string, amount: number): Promise<RefundResult>;
}


// services/payment-services/providers/RazorpayProvider.ts implements IPaymentProvider
// services/payment-services/providers/StripeProvider.ts implements IPaymentProvider  ← swap later
