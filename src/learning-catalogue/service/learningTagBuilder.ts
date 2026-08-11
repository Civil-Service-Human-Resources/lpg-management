import {LearningTagController} from '../../controllers/learningTag/learningTagController'
import {LearningTagClient} from '../client/learningTagClient'
import {OauthRestService} from '../../lib/http/oauthRestService'
import {LearningTagService} from './learningTagService'
import {LearningTagTreeCache} from '../../csl-service/model/learning/learningTag/LearningTagTreeCache'
import {Cache} from '../../lib/cache/redisCache'
import {TaxonomyTree} from '../../lib/taxonomy/taxonomyTree'
import {redisClient} from '../../lib/cache/redis'
import * as config from '../../config'
import {LearningTagCache} from '../../csl-service/model/learning/learningTag/learningTagCache'
import {LearningTagCacheManager} from '../../csl-service/model/learning/learningTag/learningTagCacheManager'
import {FormattedLearningTagListCache} from '../../csl-service/model/learning/learningTag/formattedLearningTagListCache'

export function buildLearningTagController(cslServiceClient: OauthRestService) {
	const learningTagClient = new LearningTagClient(cslServiceClient)
	const learningTagTreeRedisCache = new Cache<TaxonomyTree>(redisClient, config.LEARNING_TAG_REDIS.ttl_seconds, "learningTag", TaxonomyTree)
	const learningTagTreeCache = new LearningTagTreeCache(learningTagTreeRedisCache, learningTagClient)
	const learningTagCache = new LearningTagCache(redisClient, config.LEARNING_TAG_REDIS.ttl_seconds)
	const learningTagFormattedNameCache = new FormattedLearningTagListCache(redisClient, config.LEARNING_TAG_REDIS.ttl_seconds)
	const learningTagCacheManager = new LearningTagCacheManager(learningTagCache, learningTagFormattedNameCache, learningTagTreeCache)
	const learningTagService = new LearningTagService(learningTagCacheManager, learningTagClient)
	return new LearningTagController(learningTagService)
}