// frontend/src/services/walletServices.ts

import axiosInstance from "@/config/axios";
import type {
  GetTransactionsResponse,
  GetTransactionsParams,
  WalletOverviewResponse,
} from "@/types/wallet.types";






export const walletServices = {

   getWalletOverview: async (): Promise<WalletOverviewResponse> => {
      const response = await axiosInstance.get("/api/wallet/my-wallet");
      return response.data.data;
   },


   getTransactions: async (params: GetTransactionsParams): Promise<GetTransactionsResponse> => {
      const cleanedParams = Object.fromEntries(
         Object.entries(params).filter(([, v]) => v !== undefined && v !== "all")
      );
      const response = await axiosInstance.get("/api/wallet/transactions", { params: cleanedParams });
      return response.data.data;
   },
};