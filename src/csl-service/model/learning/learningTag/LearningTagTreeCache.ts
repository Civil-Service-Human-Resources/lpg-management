import {LearningTagClient} from '../../../../learning-catalogue/client/learningTagClient'
import {FetchedRedisCache} from '../../../../lib/cache/fetchedRedisCache'
import {Cache} from '../../../../lib/cache/redisCache'
import {TaxonomyTree} from '../../../../lib/taxonomy/taxonomyTree'

export class LearningTagTreeCache extends FetchedRedisCache<TaxonomyTree> {

	constructor(cache: Cache<TaxonomyTree>, private learningTagClient: LearningTagClient) {
		super(cache, "learningTagTree")
	}

	async fetchResource(): Promise<TaxonomyTree> {
		return await this.learningTagClient.getTree()
	}
}
