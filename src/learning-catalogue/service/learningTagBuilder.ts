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

export function buildLearningTagController(cslServiceClient: OauthRestService) {
	const learningTagClient = new LearningTagClient(cslServiceClient)
	const learningTagTreeRedisCache = new Cache<TaxonomyTree>(redisClient, config.LEARNING_TAG_REDIS.ttl_seconds, "learningTag", TaxonomyTree)
	const learningTagTreeCache = new LearningTagTreeCache(learningTagTreeRedisCache, learningTagClient)
	const learningTagCache = new LearningTagCache(redisClient, config.LEARNING_TAG_REDIS.ttl_seconds)
	const learningTagService = new LearningTagService(learningTagTreeCache, learningTagCache, learningTagClient)
	return new LearningTagController(learningTagService)
}