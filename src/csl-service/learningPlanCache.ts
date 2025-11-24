import {RedisClient} from 'redis'
import {Cache} from '../lib/cache/redisCache'

export class LearningPlanCache extends Cache<any> {
	constructor(redisClient: RedisClient, defaultTTL: number) {
		super(redisClient, defaultTTL, 'learningPlan', {} as any)
	}
}
