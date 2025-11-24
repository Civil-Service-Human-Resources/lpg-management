import {OrganisationalUnitCache} from './organisationalUnitCache'
import {FormattedOrganisationListCache} from './formattedOrganisationListCache'
import {OrganisationalUnitTreeCache} from './organisationalUnitTreeCache'
import {OrganisationalUnit} from './model/organisationalUnit'
import {GetOrganisationsFormattedParams} from '../csl-service/model/organisationalUnit/getOrganisationsFormattedParams'
import {FormattedOrganisationList} from '../csl-service/model/organisationalUnit/FormattedOrganisationList'

export class OrganisationalUnitCacheManager {
	constructor(private readonly organisationalUnitCache: OrganisationalUnitCache,
				private readonly formattedOrganisationListCache: FormattedOrganisationListCache,
				private readonly organisationalUnitTreeCache: OrganisationalUnitTreeCache) {
	}

	async getTypeahead(cacheKey: string) {
		return await this.formattedOrganisationListCache.get(cacheKey)
	}

	async setTypeahead(cacheKey: string, typeahead: FormattedOrganisationList) {
		await this.formattedOrganisationListCache.set(cacheKey, typeahead)
	}

	async get(organisationalUnitId: number) {
		return await this.organisationalUnitCache.get(organisationalUnitId)
	}

	async getTree() {
		const tree = await this.organisationalUnitTreeCache.get()
		return tree.organisationalUnits
	}

	async clearTypeahead() {
		return this.formattedOrganisationListCache.delete(new GetOrganisationsFormattedParams().getCacheKey())
	}

	async update(updatedOrganisationalUnit: OrganisationalUnit) {
		await this.organisationalUnitCache.setObject(updatedOrganisationalUnit)
	}

	async updateAndRefresh(updatedOrganisationalUnit: OrganisationalUnit) {
		await this.update(updatedOrganisationalUnit)
		await this.organisationalUnitTreeCache.delete()
		await this.clearTypeahead()
	}

	async deleteAndRefresh(ids: number[]) {
		await this.delete(ids)
		await this.organisationalUnitTreeCache.delete()
		await this.clearTypeahead()
	}

	async delete(ids: number[]) {
		await Promise.all(ids.map(id => this.organisationalUnitCache.delete(id)))
	}
}
