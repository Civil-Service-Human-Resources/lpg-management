import {getLogger} from '../../utils/logger'
import {OrganisationalUnit} from '../model/organisationalUnit'
import {OrganisationalUnitPageModel} from '../model/organisationalUnitPageModel'
import {DomainUpdate, DomainUpdateSuccess} from '../model/page/domainUpdateSuccess'
import {OrganisationalUnitClient} from '../client/organisationalUnitClient'
import {
	GetOrganisationsFormattedParams
} from '../../csl-service/model/organisationalUnit/getOrganisationsFormattedParams'
import {FormattedOrganisationList} from '../../csl-service/model/organisationalUnit/FormattedOrganisationList'
import {EditAgencyToken} from '../../controllers/organisationalUnit/model/editAgencyToken'
import {OrganisationalUnitNode} from '../../csl-service/model/organisationalUnit/organisationalUnitNode'
import {OrganisationalUnitCacheManager} from '../organisationalUnitCacheManager'

export class OrganisationalUnitService {
	logger = getLogger('OrganisationalUnitService')

	constructor(private readonly organisationalUnitCacheManager: OrganisationalUnitCacheManager,
		private organisationalUnitClient: OrganisationalUnitClient) { }

	async getOrgTree(): Promise<OrganisationalUnitNode[]> {
		return await this.organisationalUnitCacheManager.getTree()
	}

	async getAllOrganisationsTypeahead() {
		return this.getOrganisationTypeahead(new GetOrganisationsFormattedParams())
	}

	async getOrganisationTypeaheadForUser(user: any) {
		let params = new GetOrganisationsFormattedParams()
		if (!user.isUnrestrictedOrganisation()) {
			params = new GetOrganisationsFormattedParams(user.getDomain(), user.otherOrganisationalUnits.map((o: OrganisationalUnit) => {
				return o.id
			}), user.isTierOneReporter())
		}
		return this.getOrganisationTypeahead(params)
	}

	async getOrganisationTypeahead(params: GetOrganisationsFormattedParams) {
		const cacheKey = params.getCacheKey()
		let typeahead = await this.organisationalUnitCacheManager.getTypeahead(cacheKey)
		if (typeahead === undefined) {
			const formattedOrganisations = await this.organisationalUnitClient.getFormattedOrganisationList(params)
			typeahead = new FormattedOrganisationList(cacheKey, formattedOrganisations.formattedOrganisationalUnitNames)
			await this.organisationalUnitCacheManager.setTypeahead(cacheKey, typeahead)
		}
		return typeahead.formattedOrganisations
	}

	async getOrganisation(organisationalUnitId: number): Promise<OrganisationalUnit> {
		let org = await this.organisationalUnitCacheManager.get(organisationalUnitId)
		if (org === undefined) {
			org = await this.organisationalUnitClient.get(organisationalUnitId)
			await this.organisationalUnitCacheManager.update(org)
		}
		return org
	}

	async createOrganisationalUnit(organisationalUnitModel: OrganisationalUnitPageModel) {
		const organisationalUnit = await this.organisationalUnitClient.create(organisationalUnitModel)
		await this.organisationalUnitCacheManager.updateAndRefresh(organisationalUnit)
		return organisationalUnit
	}

	async updateOrganisationalUnit(organisationalUnit: OrganisationalUnit, updatedOrganisationalUnit: OrganisationalUnitPageModel) {
		this.logger.debug(`Updating organisational unit ${organisationalUnit.id} with page model ${JSON.stringify(updatedOrganisationalUnit)}`)
		organisationalUnit = await this.organisationalUnitClient.update(organisationalUnit.id, updatedOrganisationalUnit)
		await this.organisationalUnitCacheManager.updateAndRefresh(organisationalUnit)
		return organisationalUnit
	}


	async deleteOrganisationalUnit(organisationalUnitId: number) {
		this.logger.debug(`Deleting organisational Unit ${organisationalUnitId}`)
		const response = await this.organisationalUnitClient.delete(organisationalUnitId)
		await this.organisationalUnitCacheManager.deleteAndRefresh(response.deletedIds)
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: EditAgencyToken) {
		const organisationalUnit = await this.organisationalUnitClient.createAgencyToken(organisationalUnitId, agencyToken)
		await this.organisationalUnitCacheManager.update(organisationalUnit)
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: EditAgencyToken) {
		const organisationalUnit = await this.organisationalUnitClient.updateAgencyToken(organisationalUnitId, agencyToken)
		await this.organisationalUnitCacheManager.update(organisationalUnit)
	}

	async deleteAgencyToken(organisationalUnit: OrganisationalUnit): Promise<void> {
		await this.organisationalUnitClient.deleteAgencyToken(organisationalUnit.id)
		organisationalUnit.agencyToken = undefined
		await this.organisationalUnitCacheManager.update(organisationalUnit)
	}

	async addDomain(organisationalUnitId: number, domainString: string): Promise<DomainUpdateSuccess> {
		this.logger.info(`Adding ${domainString} to Organisational Unit ${organisationalUnitId}`)
		const response = await this.organisationalUnitClient.addDomain(organisationalUnitId, domainString)
		const ids = [...response.updatedChildIds, organisationalUnitId]
		await this.organisationalUnitCacheManager.delete(ids)
		return {
			...response,
			update: DomainUpdate.ADDED
		}
	}

	async removeDomain(organisationalUnitId: number, domainId: number, includeSubOrgs: boolean): Promise<DomainUpdateSuccess> {
		this.logger.info(`Removing domain with ID ${domainId} from Organisational Unit ${organisationalUnitId}.${includeSubOrgs ? '' : ' Not'} including sub organisations`)
		const response = await this.organisationalUnitClient.removeDomain(organisationalUnitId, domainId, includeSubOrgs)
		const ids = [...response.updatedChildIds, organisationalUnitId]
		await this.organisationalUnitCacheManager.delete(ids)
		return {
			...response,
			update: DomainUpdate.REMOVED
		}
	}

}
