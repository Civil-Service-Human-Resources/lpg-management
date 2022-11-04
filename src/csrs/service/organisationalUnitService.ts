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
		private readonly organisationalUnitClient: OrganisationalUnitClient) { }

	private async refreshCache() {
		const flatOrgs = await this.organisationalUnitClient.getOrgsFlat()
        await Promise.all(flatOrgs.map(async o => await this.organisationalUnitCache.set(o.id, o)))
        const typeahead = OrganisationalUnitTypeAhead.fromOrganisationalUnits(flatOrgs)
        await this.organisationalUnitCache.setTypeaheadList(typeahead)
		return flatOrgs
	}

	private async getFullFormattedName(organisationalUnit: OrganisationalUnit) {
		const hierarchy = await this.getOrgHierarchy(organisationalUnit.id)
		if (hierarchy.length > 1) {
			const reverse = hierarchy.reverse()
			const name = reverse.map(o => o.getFormattedName()).join(" | ")
			return `${name} | ${organisationalUnit.getFormattedName()}`
		} else {
			return organisationalUnit.getFormattedName()
		}
	}

	async getOrgDropdown(): Promise<OrganisationalUnitTypeAhead> {
		let typeahead = await this.organisationalUnitCache.getTypeaheadList()
		if (typeahead === undefined) {
			const flatOrgs = await this.refreshCache()
			typeahead = OrganisationalUnitTypeAhead.fromOrganisationalUnits(flatOrgs)
		}
		return typeahead
	}

	async getOrgHierarchy(organisationId: number): Promise<OrganisationalUnit[]> {
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

	private async setOrgToCache(organisationalUnit: OrganisationalUnit) {
		organisationalUnit.formattedName = await this.getFullFormattedName(organisationalUnit)
		await this.organisationalUnitCache.set(organisationalUnit.id, organisationalUnit)
	}

	async getOrganisation(organisartionalUnitId: number, includeParent: boolean = false): Promise<OrganisationalUnit> {
		let org = await this.organisationalUnitCache.get(organisartionalUnitId)
		if (org === undefined) {
			org = await this.organisationalUnitClient.getOrganisation(organisartionalUnitId)
			await this.setOrgToCache(org)
		}
		if (includeParent && org.parentId !== null) {
			org.parent = await this.getOrganisation(org.parentId)
		}
		return org
	}

	async createOrganisationalUnit(organisationalUnit: OrganisationalUnitPageModel) {
		const newOrgWithId = await this.organisationalUnitClient.create(organisationalUnit)
		await this.setOrgToCache(newOrgWithId)
		return newOrgWithId
	}
	
	async updateOrganisationalUnit(organisationalUnitId: number, organisationalUnit: OrganisationalUnitPageModel) {
		await this.organisationalUnitClient.update(organisationalUnitId, organisationalUnit)
		const org = await this.getOrganisation(organisationalUnitId)
		org.updateWithPageModel(organisationalUnit)
		await this.setOrgToCache(org)
		return org
	}

	async deleteOrganisationalUnit(organisationalUnitId: number) {
		await this.organisationalUnitClient.delete(organisationalUnitId)
		await this.organisationalUnitCache.delete(organisationalUnitId)
		await this.organisationalUnitCache.removeFromTypeahead(organisationalUnitId)
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.createAgencyToken(organisationalUnitId, agencyToken)
		const org = await this.getOrganisation(organisationalUnitId)
		org.agencyToken = agencyToken
		await this.organisationalUnitCache.set(organisationalUnitId, org)
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.updateAgencyToken(organisationalUnitId, agencyToken)
		const org = await this.getOrganisation(organisationalUnitId)
		org.agencyToken = agencyToken
		await this.organisationalUnitCache.set(organisationalUnitId, org)
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		await this.organisationalUnitClient.deleteAgencyToken(organisationalUnitId)
		const org = await this.getOrganisation(organisationalUnitId)
		org.agencyToken = undefined
		await this.organisationalUnitCache.set(organisationalUnitId, org)
	}
}
