// backend/src/utils/apiResponse.utils.ts
import { IApiResponse } from "@/types/api-response.types";
import { IPagination } from "@/types/common.types";




export class ApiResponse<T> implements IApiResponse<T> {
    private constructor(
        public readonly success     : boolean,
        public readonly message     : string,
        public readonly data?       : T,
        public readonly pagination? : IPagination
    ) {}



    public static success<T>(message: string, data?: T, pagination?: IPagination): ApiResponse<T> {
        return new ApiResponse<T>(true, message, data, pagination);
    }


    public static error<T>(message: string, data?: T): ApiResponse<T> {
        return new ApiResponse<T>(false, message, data);
    }

}