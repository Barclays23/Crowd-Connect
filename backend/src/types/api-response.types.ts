// backend/src/types/common.types.ts

import { IPagination } from "@/types/common.types";

export interface IApiResponse<T> {
    success     : boolean;
    message     : string;
    data?       : T;
    pagination? : IPagination;
}