import {TaxonomyItem} from './taxonomyItem'
import {CacheableObject} from '../cache/cacheableObject'

export interface CachedTaxonomyItem extends TaxonomyItem, CacheableObject {}