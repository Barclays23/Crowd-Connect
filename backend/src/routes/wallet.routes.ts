// backend/src/routes/wallet.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { WALLET_ROUTES } from '@/constants/routes.constants';
import { USER_ROLES } from '@/constants/user-system.constants';
import { walletController } from '@/container/dependencies';





const walletRouter = Router();

walletRouter.use(authenticate);
walletRouter.use(authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN));


walletRouter.get(WALLET_ROUTES.MY_WALLET, walletController.getWalletOverview.bind(walletController));   // GET /api/wallet
walletRouter.get(WALLET_ROUTES.WALLET_TRANSACTIONS, walletController.getTransactions.bind(walletController));    // GET /api/wallet/transactions

export default walletRouter;