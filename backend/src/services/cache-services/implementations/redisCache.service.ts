// backend/src/services/cache-services/implementations/redisCache.service.ts
import { ICacheService } from "../interfaces/ICacheService";
import { redisClient } from "@/config/redis-cache.config";



export class RedisCacheService implements ICacheService {


    async setKeyValue(key: string, value: string, ttlSeconds?: number): Promise<string | null> {
        if (ttlSeconds) {
            return await redisClient.setEx(key, ttlSeconds, value);
        } else {
            return await redisClient.set(key, value);
        }
    }


    async getKeyValue(key: string): Promise<string | null> {
        return await redisClient.get(key);
    }

    
    async deleteKeyValue(key: string): Promise<void> {
        await redisClient.del(key);
    }
}