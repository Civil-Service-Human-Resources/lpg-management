import {OrganisationalUnit} from './model/organisationalUnit'
import {FormattedOrganisation} from '../csl-service/model/organisationalUnit/FormattedOrganisation'
import {TaxonomyItemCacheManager} from '../lib/taxonomy/taxonomyItemCacheManager'
import {TaxonomyTree} from '../lib/taxonomy/taxonomyTree'
import {CacheableObjectCache} from '../lib/cache/cacheableObjectCache'
import {FormattedTaxonomyItemList} from '../lib/taxonomy/formattedTaxonomyItemList'
import {FetchedRedisCache} from '../lib/cache/fetchedRedisCache'

export class OrganisationalUnitCacheManager extends TaxonomyItemCacheManager<OrganisationalUnit, FormattedOrganisation, TaxonomyTree> {
	
	constructor(cacheableObjectCache: CacheableObjectCache<OrganisationalUnit>, formattedNameCache: CacheableObjectCache<FormattedTaxonomyItemList<FormattedOrganisation>>, formattedItemTreeCache: FetchedRedisCache<TaxonomyTree>) {
		super(cacheableObjectCache, formattedNameCache, formattedItemTreeCache)
	}
}
