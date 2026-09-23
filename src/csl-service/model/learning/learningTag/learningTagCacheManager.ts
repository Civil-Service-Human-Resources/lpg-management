import {LearningTag} from '../../../../learning-catalogue/model/learningTag/learningTag'
import {TaxonomyItemCacheManager} from '../../../../lib/taxonomy/taxonomyItemCacheManager'
import {TaxonomyTree} from '../../../../lib/taxonomy/taxonomyTree'
import {FormattedTaxonomyItem} from '../../../../lib/taxonomy/formattedTaxonomyItem'
import {CacheableObjectCache} from '../../../../lib/cache/cacheableObjectCache'
import {FormattedTaxonomyItemList} from '../../../../lib/taxonomy/formattedTaxonomyItemList'
import {FetchedRedisCache} from '../../../../lib/cache/fetchedRedisCache'
import {LearningCategoryCache} from '../../../learningCategoryCache'


export class LearningTagCacheManager extends TaxonomyItemCacheManager<LearningTag, FormattedTaxonomyItem, TaxonomyTree> {

	constructor(cacheableObjectCache: CacheableObjectCache<LearningTag>, formattedNameCache: CacheableObjectCache<FormattedTaxonomyItemList<FormattedTaxonomyItem>>, treeCache: FetchedRedisCache<TaxonomyTree>,
				private learningCategoryCache: LearningCategoryCache) {
		super(cacheableObjectCache, formattedNameCache, treeCache)
	}

	async update(updatedObject: LearningTag): Promise<void> {
		await super.update(updatedObject);
		await this.clearHomepageCache()
	}

	async clearHomepageCache() {
		await this.learningCategoryCache.deleteAllIds()
	}
}
