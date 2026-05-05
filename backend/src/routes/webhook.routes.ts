// backend/src/routes/webhook.routes.ts

import { Router } from 'express';
import { WebhookController } from '@/controllers/implementations/webhook.controller';
import { WebhookService } from '@/services/webhook-services/implementations/webhook.service';
import { IRefundStrategy } from '@/services/webhook-strategy-services/interfaces/IRefundStrategy';
import { BookingRepository } from '@/repositories/implementations/booking.repository';
import { WalletService } from '@/services/wallet-services/implementations/wallet.service';
import { UserRepository } from '@/repositories/implementations/user.repository';
import { TransactionRepository } from '@/repositories/implementations/transaction.repository';
import { BookingRefundStrategy } from '@/services/webhook-strategy-services/implementations/bookingRefund.strategy';
import { PaymentPurpose } from '@/constants/payment.constants';
import { WEBHOOK_ROUTES } from '@/constants/routes.constants';
import { RazorpayProvider } from '@/services/payment-services/providers/razorpay.provider';
import { IPaymentService } from '@/services/payment-services/interfaces/IPaymentService';
import { PaymentService } from '@/services/payment-services/implementations/payment.service';




const bookingRepo           = new BookingRepository();
const userRepo              = new UserRepository();
const transactionRepo       = new TransactionRepository();


const razorpayProvider      = new RazorpayProvider();
const paymentServices       = new Map<string, IPaymentService>();

paymentServices.set('razorpay', new PaymentService(razorpayProvider));
// paymentServices.set('stripe', new PaymentService(new StripeProvider()));


const walletService         = new WalletService(userRepo, transactionRepo);


const refundStrategies      = new Map<string, IRefundStrategy>();
const bookingRefundStgy     = new BookingRefundStrategy(bookingRepo, walletService)

refundStrategies.set(PaymentPurpose.EVENT_BOOKING, bookingRefundStgy);
// refundStrategies.set(PaymentPurpose.ROLE_UPGRADE, new UpgradeRefundStrategy(...)); // Add this later!



const webhookService        = new WebhookService(refundStrategies);


const webhookController     = new WebhookController(webhookService, paymentServices);

const webhookRouter = Router();


// webhookRouter.post(WEBHOOK_ROUTES.RAZORPAY_WEBHOOK, webhookController.handleRazorpayWebhook.bind(webhookController));
webhookRouter.post('/:provider', webhookController.handleWebhookEvent.bind(webhookController));


export default webhookRouter;