import {TaxonomyTree} from 'lib/taxonomy/taxonomyTree'
import {LearningTagClient} from '../../../../learning-catalogue/client/learningTagClient'
import {FetchedRedisCache} from '../../../../lib/cache/fetchedRedisCache'
import {Cache} from '../../../../lib/cache/redisCache'

export class LearningTagTreeCache extends FetchedRedisCache<TaxonomyTree> {

	constructor(cache: Cache<TaxonomyTree>, private learningTagClient: LearningTagClient) {
		super(cache, "learningTagTree")
	}

	async fetchResource(): Promise<TaxonomyTree> {
		return await this.learningTagClient.getTree()
	}
}
