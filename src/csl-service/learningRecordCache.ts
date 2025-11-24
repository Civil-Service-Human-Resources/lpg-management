import { Cache } from '../lib/cache/redisCache'
import { RedisClient } from 'redis'

export class LearningRecordCache extends Cache<any> {
    constructor(redisClient: RedisClient, defaultTTL: number) {
            super(redisClient, defaultTTL, 'learningRecord', {} as any)
        }
}
