// interfaces/services/payment-services/interfaces/IPaymentProvider.ts

export interface IPaymentProvider {
//   createOrder(amount: number, currency: string, receipt: string): Promise<PaymentOrder>;
  verifySignature(orderId: string, paymentId: string, signature: string): boolean;
  initiateRefund(paymentId: string, amount: number): Promise<{ refundId: string }>;
}

// services/providers/RazorpayProvider.ts implements IPaymentProvider
// services/providers/StripeProvider.ts implements IPaymentProvider  ← swap later