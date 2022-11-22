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

	async getOrgDropdown(): Promise<OrganisationalUnitTypeAhead> {
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
		this.logger.debug(`Getting Organisation ${organisationalUnitId}`)
		let org = await this.organisationalUnitCache.get(organisationalUnitId)
		if (org === undefined) {
			org = await this.getOrganisationFromApi(organisationalUnitId, includeParent)
		}
		if (includeParent && org.parentId && org.parent == null) {
			org.parent = await this.getOrganisation(org.parentId)
		}
		if (org.agencyToken) {
			org.agencyToken.capacityUsed = toInteger(await this.agencyTokenCapacityUsedService.getCapacityUsed(org.agencyToken.uid))
		}
		return org
	}

	async createOrganisationalUnit(organisationalUnitModel: OrganisationalUnitPageModel) {
		const newOrgWithId = await this.organisationalUnitClient.create(organisationalUnitModel)
		newOrgWithId.updateWithPageModel(organisationalUnitModel)
		await this.refreshSpecificOrg(newOrgWithId)
		return newOrgWithId
	}
	
	async updateOrganisationalUnit(organisationalUnitId: number, organisationalUnitModel: OrganisationalUnitPageModel) {
		this.logger.debug(`Updating organisational unit ${organisationalUnitId} with page model ${JSON.stringify(organisationalUnitModel)}`)
		await this.organisationalUnitClient.update(organisationalUnitId, organisationalUnitModel)
		const organisationalUnit = await this.getOrganisation(organisationalUnitId)
		organisationalUnit.updateWithPageModel(organisationalUnitModel)
		this.logger.debug(`Resulting organisationalUnit ${JSON.stringify(organisationalUnit)}`)
		await this.refreshSpecificOrg(organisationalUnit)
	}

	async deleteOrganisationalUnit(organisationalUnitId: number) {
		this.logger.debug(`Deleting organisational Unit ${organisationalUnitId}`)
		await this.organisationalUnitClient.delete(organisationalUnitId)
		await this.organisationalUnitCache.delete(organisationalUnitId)
		await this.refreshTypeahead()
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		const newTokenWithId = await this.organisationalUnitClient.createAgencyToken(organisationalUnitId, agencyToken)
		const organisationalUnit = await this.getOrganisation(organisationalUnitId)
		organisationalUnit.agencyToken = newTokenWithId
		await this.refreshSpecificOrg(organisationalUnit)
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		await this.organisationalUnitClient.updateAgencyToken(organisationalUnitId, agencyToken)
		const organisationalUnit = await this.getOrganisation(organisationalUnitId)
		organisationalUnit.agencyToken = agencyToken
		await this.refreshSpecificOrg(organisationalUnit)
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		await this.organisationalUnitClient.deleteAgencyToken(organisationalUnitId)
		const organisationalUnit = await this.getOrganisation(organisationalUnitId)
		organisationalUnit.agencyToken = undefined
		await this.refreshSpecificOrg(organisationalUnit)
	}

	private async getOrganisationFromApi(organisationalUnitId: number, includeParent: boolean = false): Promise<OrganisationalUnit> {
		let organisation: OrganisationalUnit = await this.organisationalUnitClient.getOrganisationalUnit(
			organisationalUnitId,
			{includeParents: includeParent}
		)
		let fetchedOrg: OrganisationalUnit | undefined = organisation
		while (fetchedOrg != null) {
			let parent: OrganisationalUnit | undefined = fetchedOrg.parent
			fetchedOrg.parent = undefined
			await this.organisationalUnitCache.set(fetchedOrg.id, fetchedOrg)
			fetchedOrg = parent
		}
		return organisation
	}

	private async refreshSpecificOrg(organisationalUnit: OrganisationalUnit) {
		await this.organisationalUnitCache.set(organisationalUnit.id, organisationalUnit)
		let typeahead = await this.organisationalUnitTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			await this.refreshTypeahead()
		} else {
			typeahead.upsertAndSort(organisationalUnit)
			await this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
		}
	}

	private async refreshTypeahead() {
		const organisationalUnits = await this.organisationalUnitClient.getAllOrganisationalUnits()
        const typeahead = OrganisationalUnitTypeAhead.createAndSort(organisationalUnits)
        this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
		return typeahead
	}
}
