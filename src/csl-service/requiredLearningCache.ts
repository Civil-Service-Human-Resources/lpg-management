import { Cache } from '../lib/cache/redisCache'
import { RedisClient } from 'redis'

export class RequiredLearningCache extends Cache<any> {
    constructor(redisClient: RedisClient, defaultTTL: number) {
            super(redisClient, defaultTTL, 'requiredLearning', {} as any)
        }
}
