// backend/src/controllers/implementations/wallet.controller.ts

import { Request, Response, NextFunction } from "express";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { TransactionsFilterQuery } from "@/types/wallet.types";
import { IWalletController } from "@/controllers/interfaces/IWalletController";
import { GetTransactionsResponse, WalletOverviewResponse } from "@/dtos/wallet.dto";
import { mapTransactionQueryToFilter } from "@/mappers/wallet.mapper";




export class WalletController implements IWalletController {

   constructor(private _walletService: IWalletService) {}


   getWalletOverview = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const userId = req.user!.userId;
         const transactionData: WalletOverviewResponse = await this._walletService.getWalletOverview(userId);

         res.status(HTTP_STATUS.OK).json({ success: true, data: transactionData });

      } catch (error) {
         next(error);
      }
   };



   getTransactions = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const filters: TransactionsFilterQuery = mapTransactionQueryToFilter(req);

         const transactionData: GetTransactionsResponse = await this._walletService.getTransactions(filters);

         res.status(HTTP_STATUS.OK).json({ success: true, data: transactionData });

      } catch (error: unknown) {
         next(error);
      }
   };


}