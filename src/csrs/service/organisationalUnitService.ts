import { toInteger } from 'lodash';
import { AgencyTokenCapacityUsedHttpService } from '../../identity/agencyTokenCapacityUsedHttpService';
import { getLogger } from '../../utils/logger';
import { OrganisationalUnitClient } from '../client/organisationalUnitClient';
import { AgencyToken } from '../model/agencyToken';
import { OrganisationalUnit } from '../model/organisationalUnit';
import { OrganisationalUnitPageModel } from '../model/organisationalUnitPageModel';
import { OrganisationalUnitTypeAhead } from '../model/organisationalUnitTypeAhead';
import { OrganisationalUnitCache } from '../organisationalUnitCache';

export class OrganisationalUnitService {
	logger = getLogger('OrganisationalUnitService')

	constructor(private readonly organisationalUnitCache: OrganisationalUnitCache,
		private readonly organisationalUnitClient: OrganisationalUnitClient,
		private readonly agencyTokenCapacityUsedService: AgencyTokenCapacityUsedHttpService) { }

	private async refreshSpecificOrgs(orgIdsToRefresh: number[]) {
		const organisationalUnits = await this.organisationalUnitClient.get(
			{
				includeFormattedName: true,
				ids: orgIdsToRefresh.join(",")
			}
		)
		await Promise.all(organisationalUnits.map(async o => await this.organisationalUnitCache.set(o.id, o)))
		const typeahead = await this.getOrgDropdown()
		typeahead.upsertAndSortMultiple(organisationalUnits)
		return organisationalUnits
	}

	private async refreshCache() {
		this.logger.warn(`Refreshing cache`)
		const organisationalUnits = await this.organisationalUnitClient.get({includeFormattedName: true})
        await Promise.all(organisationalUnits.map(async o => await this.organisationalUnitCache.set(o.id, o)))
        const typeahead = new OrganisationalUnitTypeAhead(organisationalUnits)
        await this.organisationalUnitCache.setTypeaheadList(typeahead)
		return organisationalUnits
	}

	async removeOrgFromTypeahead(organisationalUnitId: number) {
		const typeahead = await this.getOrgDropdown()
		typeahead.removeElement(organisationalUnitId)
	}

	async getOrgDropdown(): Promise<OrganisationalUnitTypeAhead> {
		console.log("Get org dropdown")
		let typeahead = await this.organisationalUnitCache.getTypeaheadList()
		if (typeahead === undefined) {
			const flatOrgs = await this.refreshCache()
			typeahead = new OrganisationalUnitTypeAhead(flatOrgs)
		}
		return typeahead
	}

	async getOrgHierarchy(organisationId: number): Promise<OrganisationalUnit[]> {
		console.log("Get org hierarchy")
		let hierarchy = await this.organisationalUnitCache.getOrgHierarchy(organisationId)
		if (hierarchy === undefined) {
			await this.refreshCache()
			return await this.getOrgHierarchy(organisationId)
		}
		return hierarchy
	}

	async getOrgTree(): Promise<OrganisationalUnit[]> {
		return await this.organisationalUnitClient.getOrgsTree()
	}

	async getOrganisation(organisartionalUnitId: number, includeParent: boolean = false): Promise<OrganisationalUnit> {
		console.log(`Getting individual org ${organisartionalUnitId}`)
		let org = await this.organisationalUnitCache.get(organisartionalUnitId)
		if (org === undefined) {
			org = (await this.organisationalUnitClient.get(
				{includeFormattedName: true, ids: organisartionalUnitId.toString()}
			))[0]
			console.log(org)
			await this.organisationalUnitCache.set(org.id, org)
		}
		console.log(org)
		if (includeParent && org.parentId != null) {
			org.parent = await this.getOrganisation(org.parentId)
		}
		if (org.agencyToken) {
			org.agencyToken.capacityUsed = toInteger(await this.agencyTokenCapacityUsedService.getCapacityUsed(org.agencyToken.uid))
		}
		return org
	}

	async createOrganisationalUnit(organisationalUnit: OrganisationalUnitPageModel) {
		const newOrgWithId = await this.organisationalUnitClient.create(organisationalUnit)
		await this.refreshSpecificOrgs([newOrgWithId.id])
		return newOrgWithId
	}
	
	async updateOrganisationalUnit(organisationalUnitId: number, organisationalUnit: OrganisationalUnitPageModel) {
		await this.organisationalUnitClient.update(organisationalUnitId, organisationalUnit)
		await this.refreshSpecificOrgs([organisationalUnitId])
	}

	async deleteOrganisationalUnit(organisationalUnitId: number) {
		await this.organisationalUnitClient.delete(organisationalUnitId)
		await this.organisationalUnitCache.delete(organisationalUnitId)
		await this.removeOrgFromTypeahead(organisationalUnitId)
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.createAgencyToken(organisationalUnitId, agencyToken)
		await this.refreshSpecificOrgs([organisationalUnitId])
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.updateAgencyToken(organisationalUnitId, agencyToken)
		await this.refreshSpecificOrgs([organisationalUnitId])
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		await this.organisationalUnitClient.deleteAgencyToken(organisationalUnitId)
		await this.refreshSpecificOrgs([organisationalUnitId])
	}
}
