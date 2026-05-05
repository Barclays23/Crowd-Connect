// backend/src/services/cache-services/interfaces/ICacheService.ts


export interface ICacheService {
   setKeyValue (key: string, value: string, ttlSeconds?: number): Promise<string | null>;
   getKeyValue (key: string): Promise<string | null>;
   deleteKeyValue (key: string): Promise<void>;
}