// backend/src/routes/wallet.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

import { UserRepository } from '@/repositories/implementations/user.repository';

import { WALLET_ROUTES } from '@/constants/routes.constants';
import { UserRole } from '@/constants/roles-and-statuses';
import { WalletController } from '@/controllers/implementations/wallet.controller';
import { WalletService } from '@/services/wallet-services/implementations/wallet.services';
import { TransactionRepository } from '@/repositories/implementations/transaction.repository';




// REPOS
const userRepo          = new UserRepository();
const transactionRepo     = new TransactionRepository();
// const payoutRequestRepo   = new PayoutRequestRepository();
// const withdrawalRequestRepo = new WithdrawalRequestRepository,


// SERVICES
const walletService = new WalletService(userRepo, transactionRepo);

// CONTROLLER
const walletController = new WalletController(walletService);



const walletRouter = Router();

walletRouter.use(authenticate);
walletRouter.use(authorize(UserRole.USER, UserRole.HOST, UserRole.ADMIN));


walletRouter.get(WALLET_ROUTES.MY_WALLET, walletController.getWalletOverview.bind(walletController));   // GET /api/wallet
walletRouter.get(WALLET_ROUTES.WALLET_TRANSACTIONS, walletController.getTransactions.bind(walletController));    // GET /api/wallet/transactions

export default walletRouter;