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

	private async refreshCache() {
		this.logger.warn(`Refreshing cache`)
		const flatOrgs = await this.organisationalUnitClient.get({includeFormattedName: true})
        await Promise.all(flatOrgs.map(async o => await this.organisationalUnitCache.set(o.id, o)))
        const typeahead = new OrganisationalUnitTypeAhead(flatOrgs)
        await this.organisationalUnitCache.setTypeaheadList(typeahead)
		return flatOrgs
	}

	private async upsertOrganisationToTypeahead(organisationalUnit: OrganisationalUnit) {
		const typeahead = await this.organisationalUnitCache.getTypeaheadList()
		if (typeahead === undefined) {
			await this.refreshCache()
			await this.upsertOrganisationToTypeahead(organisationalUnit)
		} else {
			typeahead.upsertAndSort(organisationalUnit)
			await this.organisationalUnitCache.setTypeaheadList(typeahead)
		}
	}

	private async removeOrganisationFromTypeahead(organisationalUnitId: number) {
		const typeahead = await this.organisationalUnitCache.getTypeaheadList()
		if (typeahead === undefined) {
			await this.refreshCache()
			await this.removeOrganisationFromTypeahead(organisationalUnitId)
		} else {
			typeahead.removeElement(organisationalUnitId)
			await this.organisationalUnitCache.setTypeaheadList(typeahead)
		}
	}

	private async getFullFormattedName(organisationalUnit: OrganisationalUnit) {
		const hierarchy = await this.getOrgHierarchy(organisationalUnit.id)
		if (hierarchy.length > 1) {
			const reverse = hierarchy.reverse()
			const name = reverse.map(o => o.getNameAndAbbrev()).join(" | ")
			return name
		} else {
			return organisationalUnit.getNameAndAbbrev()
		}
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

	private async formatAndSaveOrganisation(organisationalUnit: OrganisationalUnit) {
		organisationalUnit.formattedName = await this.getFullFormattedName(organisationalUnit)
		await this.organisationalUnitCache.set(organisationalUnit.id, organisationalUnit)
		await this.upsertOrganisationToTypeahead(organisationalUnit)
	}

	async getOrganisation(organisartionalUnitId: number, includeParent: boolean = false): Promise<OrganisationalUnit> {
		console.log(`Getting individual org ${organisartionalUnitId}`)
		let org = await this.organisationalUnitCache.get(organisartionalUnitId)
		if (org === undefined) {
			org = (await this.organisationalUnitClient.get(
				{includeFormattedName: true, ids: organisartionalUnitId.toString()}
			))[0]
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
		await this.formatAndSaveOrganisation(newOrgWithId)
		return newOrgWithId
	}
	
	async updateOrganisationalUnit(organisationalUnitId: number, organisationalUnit: OrganisationalUnitPageModel) {
		await this.organisationalUnitClient.update(organisationalUnitId, organisationalUnit)
		const org = await this.getOrganisation(organisationalUnitId)
		org.updateWithPageModel(organisationalUnit)
		await this.formatAndSaveOrganisation(org)
		return org
	}

	async deleteOrganisationalUnit(organisationalUnitId: number) {
		await this.organisationalUnitClient.delete(organisationalUnitId)
		await this.organisationalUnitCache.delete(organisationalUnitId)
		await this.removeOrganisationFromTypeahead(organisationalUnitId)
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.createAgencyToken(organisationalUnitId, agencyToken)
		const org = await this.getOrganisation(organisationalUnitId)
		org.agencyToken = agencyToken
		await this.organisationalUnitCache.set(organisationalUnitId, org)
		await this.upsertOrganisationToTypeahead(org)
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.updateAgencyToken(organisationalUnitId, agencyToken)
		const org = await this.getOrganisation(organisationalUnitId)
		org.agencyToken = agencyToken
		await this.organisationalUnitCache.set(organisationalUnitId, org)
		await this.upsertOrganisationToTypeahead(org)
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		await this.organisationalUnitClient.deleteAgencyToken(organisationalUnitId)
		const org = await this.getOrganisation(organisationalUnitId)
		org.agencyToken = undefined
		await this.organisationalUnitCache.set(organisationalUnitId, org)
	}
}
