import {Cache} from '../lib/cache/redisCache'
import {RedisClient} from 'redis'

export class LearningCategoryCache extends Cache<any> {
	constructor(redisClient: RedisClient, defaultTTL: number) {
		super(redisClient, defaultTTL, 'categoryPage', {} as any)
	}
}