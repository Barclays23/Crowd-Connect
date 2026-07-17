// frontend/src/services/walletServices.ts

import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type {
  GetTransactionsParams,
  ITransactionState,
  WalletOverviewData,
} from "@/types/wallet.types";






export const walletServices = {

   getWalletOverview: async (): Promise<ApiResponse<WalletOverviewData>> => {
      const response = await axiosInstance.get<ApiResponse<WalletOverviewData>>(
         API_ENDPOINTS.WALLET.OVERVIEW,
         { withCredentials: true }
      );
      return response.data;
   },

   getTransactions: async (params: GetTransactionsParams): Promise<ApiResponse<ITransactionState[]>> => {
      const searchParams = new URLSearchParams({
         page:  String(params.page  ?? 1),
         limit: String(params.limit ?? 10),
         ...(params.sortBy                                  && { sortBy:    params.sortBy }),
         ...(params.sortOrder                               && { sortOrder: params.sortOrder }),
         ...(params.direction && params.direction !== "all" && { direction: params.direction }),
         ...(params.type && params.type !== "all"           && { type:      params.type }),
         ...(params.status && params.status !== "all"       && { status:    params.status }),
      });

      const queryString: string  = searchParams.toString();
      const endPoint: string     = `${API_ENDPOINTS.WALLET.TRANSACTIONS}?${queryString}`;

      const response = await axiosInstance.get<ApiResponse<ITransactionState[]>>(
         endPoint, 
         { withCredentials: true }
      );
      return response.data;
   },

};