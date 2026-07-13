import {LearningTag} from '../../../../learning-catalogue/model/learningTag/learningTag'
import {TaxonomyItemCacheManager} from '../../../../lib/taxonomy/taxonomyItemCacheManager'
import {TaxonomyTree} from '../../../../lib/taxonomy/taxonomyTree'
import {FormattedTaxonomyItem} from '../../../../lib/taxonomy/formattedTaxonomyItem'
import {CacheableObjectCache} from '../../../../lib/cache/cacheableObjectCache'
import {FormattedTaxonomyItemList} from '../../../../lib/taxonomy/formattedTaxonomyItemList'
import {FetchedRedisCache} from '../../../../lib/cache/fetchedRedisCache'


export class LearningTagCacheManager extends TaxonomyItemCacheManager<LearningTag, FormattedTaxonomyItem, TaxonomyTree> {

	constructor(cacheableObjectCache: CacheableObjectCache<LearningTag>, formattedNameCache: CacheableObjectCache<FormattedTaxonomyItemList<FormattedTaxonomyItem>>, treeCache: FetchedRedisCache<TaxonomyTree>) {
		super(cacheableObjectCache, formattedNameCache, treeCache)
	}
}
