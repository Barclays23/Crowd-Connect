// backend/src/utils/apiResponse.utils.ts
import { IApiResponse } from "@/types/api-response.types";
import { IPagination } from "@/types/common.types";




export class ApiResponseModel<T> implements IApiResponse<T> {
    private constructor(
        public readonly success     : boolean,
        public readonly message     : string,
        public readonly data?       : T,
        public readonly pagination? : IPagination
    ) {}



    public static success<T>(message: string, data?: T, pagination?: IPagination): ApiResponseModel<T> {
        return new ApiResponseModel<T>(true, message, data, pagination);
    }


    public static error<T>(message: string, data?: T): ApiResponseModel<T> {
        return new ApiResponseModel<T>(false, message, data);
    }

}