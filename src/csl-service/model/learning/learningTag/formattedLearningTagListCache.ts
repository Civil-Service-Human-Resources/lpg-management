import {RedisClient} from 'redis'
import {CacheableObjectCache} from '../../../../lib/cache/cacheableObjectCache'
import {FormattedTaxonomyItemList} from '../../../../lib/taxonomy/formattedTaxonomyItemList'
import {FormattedTaxonomyItem} from '../../../../lib/taxonomy/formattedTaxonomyItem'

export class FormattedLearningTagListCache extends CacheableObjectCache<FormattedTaxonomyItemList<FormattedTaxonomyItem>>{

	constructor(redisClient: RedisClient, defaultTTL: number) {
		super(redisClient, defaultTTL, "formattedLearningTagList", FormattedTaxonomyItemList)
	}
}
