import {CacheableObjectCache} from '../../../../lib/cache/cacheableObjectCache'
import {RedisClient} from 'redis'
import {LearningTag} from '../../../../learning-catalogue/model/learningTag/learningTag'

export class LearningTagCache extends CacheableObjectCache<LearningTag> {

	constructor(redisClient: RedisClient, defaultTTL: number) {
		super(redisClient, defaultTTL, "learningTags", LearningTag)
	}
}