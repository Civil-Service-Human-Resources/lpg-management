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
import {DomainUpdate, DomainUpdateSuccess} from '../model/page/domainUpdateSuccess'

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

	async getOrgHierarchy(
		organisationId: number,
		hierarchy: OrganisationalUnit[] = []
	): Promise<OrganisationalUnit[]> {
		const org = await this.organisationalUnitCache.get(organisationId)
		if (org == null) {
			const orgWithAllParents = await this.organisationalUnitClient.getOrganisationalUnit(
				organisationId,
				{includeParents: true}
			)
			const orgArray = orgWithAllParents.getHierarchyAsArray()
			await this.organisationalUnitCache.setMultiple(orgArray)
			hierarchy.push(...orgArray)
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

	async getOrganisation(
		organisationalUnitId: number,
		includeParent: boolean = false
	): Promise<OrganisationalUnit> {
		let org = await this.organisationalUnitCache.get(organisationalUnitId)
		if (org === undefined) {
			org = await this.organisationalUnitClient.getOrganisationalUnit(
				organisationalUnitId,
				{includeParents: includeParent}
			)
			await this.organisationalUnitCache.setMultiple(org.getHierarchyAsArray())
		}
		if (includeParent && org.parentId != null && org.parent == null) {
			org.parent = await this.getOrganisation(org.parentId)
		}
		if (org.agencyToken) {
			org.agencyToken.capacityUsed = toInteger((await this.agencyTokenCapacityUsedService.getCapacityUsed(org.agencyToken.uid)).capacityUsed)
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
		let typeahead = await this.organisationalUnitTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			await this.refreshTypeahead(true)
		} else {
			const deletedIds = typeahead.removeOrganisation(organisationalUnitId)
			await Promise.all(deletedIds.map(id => this.organisationalUnitCache.delete(id)))
			await this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
		}
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		const newTokenWithId = await this.organisationalUnitClient.createAgencyToken(organisationalUnitId, agencyToken)
		const organisationalUnit = await this.getOrganisation(organisationalUnitId)
		organisationalUnit.agencyToken = newTokenWithId
		await this.refreshSpecificOrg(organisationalUnit)
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		agencyToken = await this.organisationalUnitClient.updateAgencyToken(organisationalUnitId, agencyToken)
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

	private async refreshSpecificOrg(organisationalUnit: OrganisationalUnit) {
		await this.refreshOrgs([organisationalUnit])
	}

	private async refreshOrgs(organisationalUnits: OrganisationalUnit[]) {
		this.logger.info(`Refreshing ${organisationalUnits.length} organisational units`)
		await this.organisationalUnitCache.setMultiple(organisationalUnits)
		let typeahead = await this.organisationalUnitTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			await this.refreshTypeahead()
		} else {
			typeahead.upsertAndSort(organisationalUnits)
			await this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
		}
	}

	private async refreshTypeahead(refreshIndividuals: boolean = false) {
		const organisationalUnits = await this.organisationalUnitClient.getAllOrganisationalUnits()
		if (refreshIndividuals) {
			await this.organisationalUnitCache.setMultiple(organisationalUnits)
		}
        const typeahead = OrganisationalUnitTypeAhead.createAndSort(organisationalUnits)
        await this.organisationalUnitTypeaheadCache.setTypeahead(typeahead)
		return typeahead
	}

	private async alterMultipleOrgsInCache(orgIds: number[], update: (org: OrganisationalUnit) => void) {
		const orgsToFetch: number[] = []
		const updateBatch: OrganisationalUnit[] = []
		await Promise.all(orgIds.map(
			async id => {
				let org = await this.organisationalUnitCache.get(id)
				if (org === undefined) {
					orgsToFetch.push(id)
				} else {
					update(org)
					updateBatch.push(org)
				}
			}
		))
		if (orgsToFetch.length > 0) {
			updateBatch.push(...await this.organisationalUnitClient.getSpecificOrganisationalUnits(orgsToFetch))
		}
		if (updateBatch.length > 0) {
			await this.refreshOrgs(updateBatch)
		}
	}

	async addDomain(organisationalUnitId: number, domainString: string): Promise<DomainUpdateSuccess> {
		this.logger.info(`Adding ${domainString} to Organisational Unit ${organisationalUnitId}`)
		const response = await this.organisationalUnitClient.addDomain(organisationalUnitId, domainString)
		let parentOrg = await this.getOrganisation(organisationalUnitId)
		parentOrg.insertAndSortDomain(response.domain)
		await this.refreshOrgs([parentOrg])
		if (response.updatedChildOrganisationIds.length > 0) {
			this.alterMultipleOrgsInCache(response.updatedChildOrganisationIds, (org: OrganisationalUnit) => {
				org.insertAndSortDomain(response.domain)
			})
			.then(() => {
				this.logger.info(`Successfully added domain to ${response.updatedChildOrganisationIds.length} child organisations`)
			})
		}
		return {
			organisationalUnit: parentOrg,
			domain: domainString,
			childOrgsUpdatedCount: response.updatedChildOrganisationIds.length,
			update: DomainUpdate.ADDED
		}
	}

	async removeDomain(organisationalUnitId: number, domainId: number, includeSubOrgs: boolean): Promise<DomainUpdateSuccess> {
		this.logger.info(`Removing domain with ID ${domainId} from Organisational Unit ${organisationalUnitId}`)
		const response = await this.organisationalUnitClient.removeDomain(organisationalUnitId, domainId,
			{ includeSubOrgs })
		let parentOrg = await this.getOrganisation(organisationalUnitId)
		parentOrg.removeAndSortDomain(domainId)
		await this.refreshOrgs([parentOrg])
		if (response.updatedChildOrganisationIds.length > 0) {
			this.alterMultipleOrgsInCache(response.updatedChildOrganisationIds, (org: OrganisationalUnit) => {
				org.removeAndSortDomain(domainId)
			}).then(() => {
				this.logger.info(`Successfully removed domain from ${response.updatedChildOrganisationIds.length} child organisations`)
			})
		}
		return {
			organisationalUnit: parentOrg,
			domain: response.domain.domain,
			childOrgsUpdatedCount: response.updatedChildOrganisationIds.length,
			update: DomainUpdate.REMOVED
		}
	}
}
