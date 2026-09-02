// backend/src/container/dependencies.ts
import { PAYMENT_PURPOSES } from "@/constants/payment.constants";
import { RoomServiceClient } from "livekit-server-sdk";
import { LiveKitConfig } from "@/types/streaming.types";

import { AiController } from "@/controllers/implementations/ai.controller";
import { AuthController } from "@/controllers/implementations/auth.controller";
import { BookingController } from "@/controllers/implementations/booking.controller";
import { ChatController } from "@/controllers/implementations/chat.controller";
import { CheckinController } from "@/controllers/implementations/checkin.controller";
import { EventController } from "@/controllers/implementations/event.controller";
import { HostController } from "@/controllers/implementations/host.controller";
import { PayoutController } from "@/controllers/implementations/payout.controller";
import { PlatformSettingsController } from "@/controllers/implementations/platformSettings.controller";
import { ReviewController } from "@/controllers/implementations/review.controller";
import { UserController } from "@/controllers/implementations/user.controller";
import { WalletController } from "@/controllers/implementations/wallet.controller";
import { WebhookController } from "@/controllers/implementations/webhook.controller";

import { UserRepository } from "@/repositories/implementations/user.repository";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { MongoFaqRepository } from "@/repositories/implementations/mongoFaq.repository";
import { CheckinRepository } from "@/repositories/implementations/checkin.repository";
import { PayoutRepository } from "@/repositories/implementations/payout.repository";
import { ReviewRepository } from "@/repositories/implementations/review.repository";
import { TransactionRepository } from "@/repositories/implementations/transaction.repository";
import { PlatformSettingsRepository } from "@/repositories/implementations/platformSettings.repository";

import { GoogleGenAI } from "@google/genai";

import { PollinationsImageProvider } from "@/providers/ai-image-providers/implementations/PollinationsImageProvider";
import { GeminiAiChatProvider } from "@/providers/ai-chat-providers/implementations/GeminiChatProvider";
import { RazorpayProvider } from "@/providers/payment-providers/razorpay.provider";
import { IPaymentProvider } from "@/providers/payment-providers/IPaymentProvider";
import { mailDispatcher } from "@/services/mail-services/implementations/MailServiceFactory";



import { AiChatService } from "@/services/ai-chat-services/implementations/aiChat.service";
import { AiImageService } from "@/services/ai-image-services/implementations/aiImage.service";
import { FaqIngestionService } from "@/services/ai-chat-services/implementations/faqIngestion.service";
import { RedisCacheService } from "@/services/cache-services/implementations/redisCache.service";
import { PasswordService } from "@/services/password-services/implementations/password.service";
import { AuthRecoveryService } from "@/services/auth-services/implementations/authRecovery.service";
import { AuthRegistrationService } from "@/services/auth-services/implementations/authRegistration.service";
import { AuthSessionService } from "@/services/auth-services/implementations/authSession.service";
import { TicketService } from "@/services/ticket-services/implementations/ticket.service";
import { GeminiProfanityFilterService } from "@/services/profanity-services/implementations/GeminiProfanityFilterService";
import { LiveKitStreamingService } from "@/services/streaming-services/implementations/LiveKitStreamingService";
import { EventQueueService } from "@/services/queue-services/implementaions/eventQueue.service";


import { BookingService } from "@/services/booking-services/implementations/booking.service";
import { WalletService } from "@/services/wallet-services/implementations/wallet.service";
import { PlatformSettingsService } from "@/services/platform-settings-services/implementations/platformSettings.service";
import { CheckinService } from "@/services/checkin-services/implementations/checkin.service";
import { EventManagementService } from "@/services/event-services/implementations/event.service";
import { UserProfileService } from "@/services/user-services/implementations/userProfile.service";
import { HostManagementService } from "@/services/host-services/implementations/HostManagement.service";
import { PayoutService } from "@/services/payout-services/implementations/payout.service";
import { ReviewService } from "@/services/review-services/implementations/review.service";
import { UserManagementService } from "@/services/user-services/implementations/userManagement.service";
import { WebhookService } from "@/services/webhook-services/implementations/webhook.service";
import { PaymentService } from "@/services/payment-services/implementations/payment.service";


import { IPaymentSuccessStrategy } from "@/services/webhook-strategy-services/interfaces/IPaymentSuccessStrategy";
import { IPaymentFailedStrategy } from "@/services/webhook-strategy-services/interfaces/IPaymentFailedStrategy";
import { IRefundStrategy } from "@/services/webhook-strategy-services/interfaces/IRefundStrategy";
import { BookingRefundStrategy } from "@/services/webhook-strategy-services/implementations/bookingRefund.strategy";
import { BookingPaymentSuccessStrategy } from "@/services/webhook-strategy-services/implementations/bookingPaymentSuccess.strategy";
import { BookingPaymentFailedStrategy } from "@/services/webhook-strategy-services/implementations/bookingPaymentFailed.strategy";










// ============================================================================
// CONFIGURATIONS & EXTERNAL CLIENTS
// ============================================================================
// const generativeAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);  this legacy SDK will depricate soon
const genAI         = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
// const openAI        = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// STREAMING CONFIGURATIONS ──────────────────────────────────────────────
export const liveKitConfig: LiveKitConfig = {
    livekitApiUrl: process.env.LIVEKIT_URL || '',
    apiKey: process.env.LIVEKIT_API_KEY || '',
    apiSecret: process.env.LIVEKIT_API_SECRET || ''
};

export const liveKitRoomServiceClient: RoomServiceClient = new RoomServiceClient(
    liveKitConfig.livekitApiUrl, 
    liveKitConfig.apiKey, 
    liveKitConfig.apiSecret
);





// ============================================================================
// PROVIDERS
// ============================================================================
// _________ Payment Providers ________________
const razorpayProvider  = new RazorpayProvider();
// const paymentProvider   = new RazorpayProvider();
// const stripeProvider    = new StripeProvider();  // add when Stripe is wired up



const paymentProvidersMap = new Map<string, IPaymentProvider>();
paymentProvidersMap.set('razorpay', razorpayProvider);
// paymentProvidersMap.set('stripe', stripeProvider);




// _________ AI Image Providers ________________
const aiImageProvider   = new PollinationsImageProvider();
// const aiImageProvider   = new GeminiImageProvider(genAI);
// const aiImageProvider   = new OpenAiImageProvider(openAI);
// const aiImageProvider   = new FalImageProvider();  // Fal/Flux provider ($0.004/mega pixel)
// const aiImageProvider   = new HuggingFaceImageProvider();


// _________ AI Chat Providers ________________
const aiChatProvider   = new GeminiAiChatProvider(genAI);  // which ever the AI chat provider used








// ============================================================================
// REPOSITORIES
// ============================================================================
const userRepo          = new UserRepository();
const bookingRepo       = new BookingRepository();
const eventRepo         = new EventRepository();
const reviewRepo        = new ReviewRepository();
const checkinRepo       = new CheckinRepository();
const transactionRepo   = new TransactionRepository();
const payoutRepo        = new PayoutRepository();
const settingsRepo      = new PlatformSettingsRepository();


const faqKnowledgeRepo  = new MongoFaqRepository();  //  which ever the FaqKnowledgeRepository used
// const vectorRepo     = new PgVectorRepository();
// const vectorRepo     = new MongoVectorRepository();
// const payoutRequestRepo     = new PayoutRequestRepository();
// const withdrawalRequestRepo = new WithdrawalRequestRepository();






// ============================================================================
// 4. CORE SERVICES & UTILITIES (Independent)
// ============================================================================
const cacheService          = new RedisCacheService();
const ticketService         = new TicketService();
const eventQueueService     = new EventQueueService();
export const streamingService      = new LiveKitStreamingService(liveKitConfig, liveKitRoomServiceClient);


// _________ PROFANITY FILTER SERVICES ___________________
const profanityFilter   = new GeminiProfanityFilterService(genAI);
// const profanityFilter   = new OpenAIProfanityFilterService(openAI);
// const profanityFilter   = new BadWordsFilterService();







// ============================================================================
// 5. DOMAIN SERVICES (Level 1 Dependencies)
// ============================================================================
const paymentService            = new PaymentService(razorpayProvider);
const aiImageService            = new AiImageService(aiImageProvider);
const faqIngestionService       = new FaqIngestionService(faqKnowledgeRepo, aiChatProvider);
const walletService             = new WalletService(userRepo, transactionRepo);
const settingsService           = new PlatformSettingsService(settingsRepo, faqIngestionService);
const aiChatService             = new AiChatService(faqKnowledgeRepo, aiChatProvider);
const checkinService            = new CheckinService(checkinRepo, eventRepo);
const userProfileService        = new UserProfileService(userRepo);
const userManagementServices    = new UserManagementService(userRepo);
const hostManagementService     = new HostManagementService(userRepo);












// ============================================================================
// 6. COMPLEX DOMAIN SERVICES (Level 2+ Dependencies)
// ============================================================================
const registrationService   = new AuthRegistrationService(userRepo, cacheService, mailDispatcher);
const sessionService        = new AuthSessionService(userRepo, cacheService);
const recoveryService       = new AuthRecoveryService(userRepo, cacheService, mailDispatcher);
const passwordService       = new PasswordService(userRepo, cacheService)

const bookingService        = new BookingService(bookingRepo, eventRepo, userRepo, paymentService, ticketService, walletService, cacheService, settingsService);
const eventService          = new EventManagementService(eventRepo, bookingRepo, checkinRepo, bookingService, userProfileService, cacheService, settingsService, eventQueueService, streamingService);
const payoutService         = new PayoutService(payoutRepo, eventRepo, settingsService, walletService);
const reviewService         = new ReviewService(reviewRepo, bookingRepo, eventRepo, userRepo, profanityFilter);






// ============================================================================
// 7. WEBHOOK STRATEGIES & ORCHESTRATION
// ============================================================================

const bookingRefundStgy         = new BookingRefundStrategy(bookingRepo, walletService);
const bookingPaymentSuccessStgy = new BookingPaymentSuccessStrategy(bookingRepo, bookingService);
const bookingPaymentFailedStgy  = new BookingPaymentFailedStrategy(bookingRepo);


// map webhook strategies (for their purpose)
const successStrategies = new Map<string, IPaymentSuccessStrategy>();
const failedStrategies  = new Map<string, IPaymentFailedStrategy>();
const refundStrategies  = new Map<string, IRefundStrategy>();



successStrategies.set(PAYMENT_PURPOSES.EVENT_BOOKING, bookingPaymentSuccessStgy);
// Future: successStrategies.set(PaymentPurpose.ROLE_UPGRADE, new RoleUpgradeSuccessStrategy(...));

failedStrategies.set(PAYMENT_PURPOSES.EVENT_BOOKING, bookingPaymentFailedStgy);


refundStrategies.set(PAYMENT_PURPOSES.EVENT_BOOKING, bookingRefundStgy);
// Future: refundStrategies.set(PaymentPurpose.ROLE_UPGRADE, new UpgradeRefundStrategy(...)); // Add this later!




const webhookService        = new WebhookService(successStrategies, failedStrategies, refundStrategies);











// ============================================================================
// 8. CONTROLLERS (Exported for Route Files)
// ============================================================================
export const aiController       = new AiController(aiImageService);
export const authController     = new AuthController(registrationService, sessionService, recoveryService, passwordService);
export const bookingController  = new BookingController(bookingService);
export const chatController     = new ChatController(aiChatService);
export const checkinController  = new CheckinController(checkinService);
export const eventController    = new EventController(eventService, bookingService);
export const hostController     = new HostController(hostManagementService);
export const payoutController   = new PayoutController(payoutService);
export const reviewController   = new ReviewController(reviewService);
export const settingsController = new PlatformSettingsController(settingsService);
export const userController     = new UserController(userProfileService, userManagementServices, passwordService);
export const walletController   = new WalletController(walletService);
export const webhookController  = new WebhookController(webhookService, paymentProvidersMap);