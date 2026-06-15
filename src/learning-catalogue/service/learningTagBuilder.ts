import {LearningTagController} from '../../controllers/learningTag/learningTagController'
import {LearningTagClient} from '../client/learningTagClient'
import {OauthRestService} from '../../lib/http/oauthRestService'
import {LearningTagService} from './learningTagService'
import {LearningTagTreeCache} from '../../csl-service/model/learning/learningTag/LearningTagTreeCache'
import {Cache} from '../../lib/cache/redisCache'
import {TaxonomyTree} from '../../lib/taxonomy/taxonomyTree'
import {redisClient} from '../../lib/cache/redis'
import * as config from '../../config'

export function buildLearningTagController(cslServiceClient: OauthRestService) {
	const learningTagClient = new LearningTagClient(cslServiceClient)
	const learningTagCache = new Cache<TaxonomyTree>(redisClient, config.LEARNING_TAG_REDIS.ttl_seconds, "learningTag", TaxonomyTree)
	const learningTagTreeCache = new LearningTagTreeCache(learningTagCache, learningTagClient)
	const learningTagService = new LearningTagService(learningTagTreeCache)
	return new LearningTagController(learningTagService)
}