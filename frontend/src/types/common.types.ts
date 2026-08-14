// frontent/src/types/common.types.ts



export interface IPagination {
  totalCount  : number;
  limit       : number;
  currentPage : number;
  totalPages  : number;
}



// Standardized Generic Wrapper for all API interactions
export interface ApiResponse<T = unknown> {
  success     : boolean;
  message     : string;
  data        : T;
  pagination? : IPagination;
}