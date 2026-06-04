// backend/src/routes/payout.routes.ts  (Host routes)
import { Router } from "express";
import { UserRole } from "@/constants/roles-and-statuses";
import { PayoutController } from "@/controllers/implementations/payout.controller";
import { PayoutService } from "@/services/payout-services/implementations/payout.service";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { PlatformSettingsService } from "@/services/platform-settings-services/implementations/platformSettings.service";
import { WalletService } from "@/services/wallet-services/implementations/wallet.service";
import { PayoutRepository } from "@/repositories/implementations/payout.repository";
import { PlatformSettingsRepository } from "@/repositories/implementations/platformSettings.repository";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { TransactionRepository } from "@/repositories/implementations/transaction.repository";
import { PAYOUT_ROUTES } from "@/constants/routes.constants";
import { uploadImage } from "@/middlewares/file-upload.middleware";



// repository layers
const payoutRepo        = new PayoutRepository()
const eventRepo         = new EventRepository()
const settingsRepo      = new PlatformSettingsRepository()
const userRepo          = new UserRepository()
const transactionRepo   = new TransactionRepository()




//service layers
const settingsService   = new PlatformSettingsService(settingsRepo)
const walletService     = new WalletService(userRepo, transactionRepo)
const payoutService     = new PayoutService(payoutRepo, eventRepo, settingsService, walletService);



// controller layer
const payoutController  = new PayoutController(payoutService)


const payoutRouter = Router();

// middleware
payoutRouter.use(authenticate, authorize(UserRole.HOST));


// completed events available for payout request
payoutRouter.get(PAYOUT_ROUTES.ELIGIBLE_EVENTS, payoutController.getEligibleEvents.bind(payoutController));

// submit a payout request for a completed event
payoutRouter.post(PAYOUT_ROUTES.REQUEST_PAYOUT, uploadImage.array("payout-proofs", 3), payoutController.requestPayout.bind(payoutController));

// host's own payout history
payoutRouter.get(PAYOUT_ROUTES.MY_PAYOUTS, payoutController.getMyPayouts.bind(payoutController));



export default payoutRouter;