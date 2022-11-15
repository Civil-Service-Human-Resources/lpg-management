import { toInteger } from 'lodash';
import { AgencyTokenCapacityUsedHttpService } from '../../identity/agencyTokenCapacityUsedHttpService';
import { getLogger } from '../../utils/logger';
import { OrganisationalUnitClient } from '../client/organisationalUnitClient';
import { AgencyToken } from '../model/agencyToken';
import { OrganisationalUnit } from '../model/organisationalUnit';
import { OrganisationalUnitPageModel } from '../model/organisationalUnitPageModel';
import { OrganisationalUnitTypeAhead } from '../model/organisationalUnitTypeAhead';
import { OrganisationalUnitCache } from '../organisationalUnitCache';
import { OrganisationalUnitTypeaheadCache } from '../organisationalUnitTypeaheadCache';

export class OrganisationalUnitService {
	logger = getLogger('OrganisationalUnitService')

	constructor(private readonly organisationalUnitCache: OrganisationalUnitCache,
		private readonly organisationalUnitTypeaheadCache : OrganisationalUnitTypeaheadCache,
		private readonly organisationalUnitClient: OrganisationalUnitClient,
		private readonly agencyTokenCapacityUsedService: AgencyTokenCapacityUsedHttpService) { }

	async removeOrgFromTypeahead(organisationalUnitId: number) {
		const typeahead = await this.getOrgDropdown()
		typeahead.removeElement(organisationalUnitId)
	}

	async getOrgDropdown(): Promise<OrganisationalUnitTypeAhead> {
		console.log("Get org dropdown")
		let typeahead = await this.organisationalUnitTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			typeahead = await this.refreshTypeahead()
		}
		return typeahead
	}

	async getOrgHierarchy(organisationId: number, hierarchy: OrganisationalUnit[] = []): Promise<OrganisationalUnit[]> {
        let org = await this.organisationalUnitCache.get(organisationId)
		if (org == null) {
			let orgWithAllParents = await this.getOrganisationFromApi(organisationId, true)
			return orgWithAllParents.getHierarchyAsArray()
		} else {
			hierarchy.push(org)
			if (org.parentId) {
				return await this.getOrgHierarchy(org.parentId, hierarchy)
			}
		}
		return hierarchy
    }

	async getOrgTree(): Promise<OrganisationalUnit[]> {
		const dropdown = await this.getOrgDropdown()
		return dropdown.getAsTree()
	}

	async getOrganisation(organisationalUnitId: number, includeParent: boolean = false): Promise<OrganisationalUnit> {
		let org = await this.organisationalUnitCache.get(organisationalUnitId)
		if (org === undefined) {
			org = await this.getOrganisationFromApi(organisationalUnitId, includeParent)
		}
		if (includeParent && org.parentId != null && org.parent == null) {
			org.parent = await this.getOrganisation(org.parentId)
		}
		if (org.agencyToken) {
			org.agencyToken.capacityUsed = toInteger(await this.agencyTokenCapacityUsedService.getCapacityUsed(org.agencyToken.uid))
		}
		return org
	}

	async createOrganisationalUnit(organisationalUnit: OrganisationalUnitPageModel) {
		const newOrgWithId = await this.organisationalUnitClient.create(organisationalUnit)
		await this.refreshSpecificOrg(newOrgWithId.id)
		return newOrgWithId
	}
	
	async updateOrganisationalUnit(organisationalUnitId: number, organisationalUnit: OrganisationalUnitPageModel) {
		await this.organisationalUnitClient.update(organisationalUnitId, organisationalUnit)
		await this.refreshSpecificOrg(organisationalUnitId)
	}

	async deleteOrganisationalUnit(organisationalUnitId: number) {
		await this.organisationalUnitClient.delete(organisationalUnitId)
		await this.organisationalUnitCache.delete(organisationalUnitId)
		await this.removeFromTypeahead(organisationalUnitId)
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.createAgencyToken(organisationalUnitId, agencyToken)
		await this.refreshSpecificOrg(organisationalUnitId)
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.updateAgencyToken(organisationalUnitId, agencyToken)
		await this.refreshSpecificOrg(organisationalUnitId)
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		await this.organisationalUnitClient.deleteAgencyToken(organisationalUnitId)
		await this.refreshSpecificOrg(organisationalUnitId)
	}

	private async getOrganisationFromApi(organisationalUnitId: number, includeParent: boolean = false): Promise<OrganisationalUnit> {
		let organisation: OrganisationalUnit = await this.organisationalUnitClient.getOrganisationalUnit(
			organisationalUnitId,
			{includeParents: includeParent}
		)
		let fetchedOrg: OrganisationalUnit | undefined = organisation
		while (fetchedOrg != null) {
			await this.organisationalUnitCache.set(fetchedOrg.id, fetchedOrg)
			fetchedOrg = fetchedOrg.parent
		}
		return organisation
	}

	private async refreshSpecificOrg(organisationalUnitId: number) {
		const organisationalUnit = await this.organisationalUnitClient.getOrganisationalUnit(organisationalUnitId)
		await this.organisationalUnitCache.set(organisationalUnit.id, organisationalUnit)
		const typeahead = await this.getOrgDropdown()
		typeahead.upsertAndSort(organisationalUnit)
		this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
		return organisationalUnit
	}

	private async refreshTypeahead() {
		const organisationalUnits = await this.organisationalUnitClient.getAllOrganisationalUnits()
        const typeahead = new OrganisationalUnitTypeAhead(organisationalUnits)
        this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
		return typeahead
	}

	private async removeFromTypeahead(organisationalUnitId: number) {
		const typeahead = await this.getOrgDropdown()
		typeahead.removeElement(organisationalUnitId)
		this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
	}
}
