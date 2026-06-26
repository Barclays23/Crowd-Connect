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
import { PAYMENT_PURPOSES } from '@/constants/payment.constants';
import { WEBHOOK_ROUTES } from '@/constants/routes.constants';
import { RazorpayProvider } from '@/services/payment-services/providers/razorpay.provider';
import { IPaymentService } from '@/services/payment-services/interfaces/IPaymentService';
import { PaymentService } from '@/services/payment-services/implementations/payment.service';
import { BookingPaymentSuccessStrategy } from '@/services/webhook-strategy-services/implementations/bookingPaymentSuccess.strategy';
import { BookingPaymentFailedStrategy } from '@/services/webhook-strategy-services/implementations/bookingPaymentFailed.strategy';
import { IPaymentSuccessStrategy } from '@/services/webhook-strategy-services/interfaces/IPaymentSuccessStrategy';
import { IPaymentFailedStrategy } from '@/services/webhook-strategy-services/interfaces/IPaymentFailedStrategy';
import { BookingService } from '@/services/booking-services/implementations/booking.service';
import { EventRepository } from '@/repositories/implementations/event.repository';
import { TicketService } from '@/services/ticket-services/implementations/ticket.service';
import { RedisCacheService } from '@/services/cache-services/implementations/redisCache.service';
import { PlatformSettingsService } from '@/services/platform-settings-services/implementations/platformSettings.service';
import { PlatformSettingsRepository } from '@/repositories/implementations/platformSettings.repository';



// REPOSITORY LAYERS
const bookingRepo           = new BookingRepository();
const eventRepo             = new EventRepository();
const userRepo              = new UserRepository();
const transactionRepo       = new TransactionRepository();
const settingsRepo          = new PlatformSettingsRepository();



// PAYMENT PROVIDER & SERVICE
const razorpayProvider      = new RazorpayProvider();
const paymentServices       = new Map<string, IPaymentService>();
paymentServices.set('razorpay', new PaymentService(razorpayProvider));
// paymentServices.set('stripe', new PaymentService(new StripeProvider()));





// map webhook strategies (for their purpose)
const successStrategies = new Map<string, IPaymentSuccessStrategy>();
const failedStrategies  = new Map<string, IPaymentFailedStrategy>();
const refundStrategies  = new Map<string, IRefundStrategy>();





// SERVICE LAYERS
const walletService         = new WalletService(userRepo, transactionRepo);
const webhookService        = new WebhookService(successStrategies, failedStrategies, refundStrategies);
const paymentService        = new PaymentService(razorpayProvider);
const ticketService         = new TicketService(bookingRepo, eventRepo);
const cacheService          = new RedisCacheService();
const settingsService       = new PlatformSettingsService(settingsRepo);
const bookingService        = new BookingService(bookingRepo, eventRepo, userRepo, paymentService, ticketService, walletService, cacheService, settingsService);




// EVENT_BOOKING strategies
const bookingRefundStgy         = new BookingRefundStrategy(bookingRepo, walletService)
const bookingPaymentSuccessStgy = new BookingPaymentSuccessStrategy(bookingRepo, bookingService);
const bookingPaymentFailedStgy  = new BookingPaymentFailedStrategy(bookingRepo);











successStrategies.set(PAYMENT_PURPOSES.EVENT_BOOKING, bookingPaymentSuccessStgy);
// Future: successStrategies.set(PaymentPurpose.ROLE_UPGRADE, new RoleUpgradeSuccessStrategy(...));

failedStrategies.set(PAYMENT_PURPOSES.EVENT_BOOKING, bookingPaymentFailedStgy);

refundStrategies.set(PAYMENT_PURPOSES.EVENT_BOOKING, bookingRefundStgy);
// Future: refundStrategies.set(PaymentPurpose.ROLE_UPGRADE, new UpgradeRefundStrategy(...)); // Add this later!








// CONTROLLER
const webhookController     = new WebhookController(webhookService, paymentServices);


// ROUTER
const webhookRouter = Router();


// webhookRouter.post(WEBHOOK_ROUTES.RAZORPAY_WEBHOOK, webhookController.handleRazorpayWebhook.bind(webhookController));
webhookRouter.post(WEBHOOK_ROUTES.PROVIDER_WEBHOOK, webhookController.handleWebhookEvent.bind(webhookController));


export default webhookRouter;