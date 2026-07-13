import {CachedTaxonomyItem} from './cachedTaxonomyItem'
import {FormattedTaxonomyItem} from './formattedTaxonomyItem'
import {TaxonomyTree} from './taxonomyTree'
import {CacheableObjectCache} from '../cache/cacheableObjectCache'
import {FormattedTaxonomyItemList} from './formattedTaxonomyItemList'
import {FetchedRedisCache} from '../cache/fetchedRedisCache'
import {
	GetOrganisationsFormattedParams,
} from '../../csl-service/model/organisationalUnit/getOrganisationsFormattedParams'

export class TaxonomyItemCacheManager<Object extends CachedTaxonomyItem, FormattedItem extends FormattedTaxonomyItem,
	Tree extends TaxonomyTree> {
	constructor(protected readonly cacheableObjectCache: CacheableObjectCache<Object>,
				protected readonly formattedNameCache: CacheableObjectCache<FormattedTaxonomyItemList<FormattedItem>>,
				protected readonly treeCache: FetchedRedisCache<Tree>
				) {
	}

	async getAllTypeahead() {
		return await this.formattedNameCache.get("all")
	}

	async getTypeahead(cacheKey: string) {
		return await this.formattedNameCache.get(cacheKey)
	}

	async setAllTypeahead(typeahead: FormattedTaxonomyItemList<FormattedItem>) {
		await this.formattedNameCache.set("all", typeahead)
	}

	async setTypeahead(cacheKey: string, typeahead: FormattedTaxonomyItemList<FormattedItem>) {
		await this.formattedNameCache.set(cacheKey, typeahead)
	}

	async get(objectId: number) {
		return await this.cacheableObjectCache.get(objectId)
	}

	async getTree() {
		const tree = await this.treeCache.get()
		return tree.content
	}

	async clearTypeahead() {
		return this.formattedNameCache.delete(new GetOrganisationsFormattedParams().getCacheKey())
	}

	async update(updatedObject: Object) {
		await this.cacheableObjectCache.setObject(updatedObject)
	}

	async updateAndRefresh(updatedObject: Object) {
		await this.update(updatedObject)
		await this.treeCache.delete()
		await this.clearTypeahead()
	}

	async deleteAndRefresh(ids: number[]) {
		await this.delete(ids)
		await this.treeCache.delete()
		await this.clearTypeahead()
	}

	async delete(ids: number[]) {
		await Promise.all(ids.map(id => this.cacheableObjectCache.delete(id)))
	}
}