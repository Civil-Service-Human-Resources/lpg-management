import {getLogger} from '../../utils/logger'
import {AgencyToken} from '../model/agencyToken'
import {OrganisationalUnit} from '../model/organisationalUnit'
import {OrganisationalUnitPageModel} from '../model/organisationalUnitPageModel'
import {OrganisationalUnitCache} from '../organisationalUnitCache'
import {DomainUpdate, DomainUpdateSuccess} from '../model/page/domainUpdateSuccess'
import {CslServiceClient} from '../../csl-service/client'

export class OrganisationalUnitService {
	logger = getLogger('OrganisationalUnitService')

	constructor(private readonly organisationalUnitCache: OrganisationalUnitCache,
		private cslServiceClient: CslServiceClient) { }

	async getOrgTree(): Promise<OrganisationalUnit[]> {
		return await this.cslServiceClient.getOrganisationalTree()
	}

	async getOrganisation(organisationalUnitId: number): Promise<OrganisationalUnit> {
		let org = await this.organisationalUnitCache.get(organisationalUnitId)
		if (org === undefined) {
			org = await this.cslServiceClient.getOrganisationalUnit(organisationalUnitId)
			await this.organisationalUnitCache.setObject(org)
		}
		return org
	}

	async createOrganisationalUnit(organisationalUnitModel: OrganisationalUnitPageModel) {
		return await this.cslServiceClient.createOrganisationalUnit(organisationalUnitModel)
	}

	async updateOrganisationalUnit(organisationalUnitId: number, organisationalUnitModel: OrganisationalUnitPageModel) {
		this.logger.debug(`Updating organisational unit ${organisationalUnitId} with page model ${JSON.stringify(organisationalUnitModel)}`)
		return await this.cslServiceClient.updateOrganisationalUnit(organisationalUnitId, organisationalUnitModel)
	}

	async deleteOrganisationalUnit(organisationalUnitId: number) {
		this.logger.debug(`Deleting organisational Unit ${organisationalUnitId}`)
		const response = await this.cslServiceClient.deleteOrganisationalUnit(organisationalUnitId)
		await Promise.all(response.deletedIds.map(id => this.organisationalUnitCache.delete(id)))
	}

	async createAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		return await this.cslServiceClient.createAgencyToken(organisationalUnitId, agencyToken)
	}

	async updateAgencyToken(organisationalUnitId: number, agencyToken: AgencyToken) {
		return await this.cslServiceClient.updateAgencyToken(organisationalUnitId, agencyToken)
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		return await this.cslServiceClient.deleteAgencyToken(organisationalUnitId)
	}

	async addDomain(organisationalUnitId: number, domainString: string): Promise<DomainUpdateSuccess> {
		this.logger.info(`Adding ${domainString} to Organisational Unit ${organisationalUnitId}`)
		const response = await this.cslServiceClient.addDomainToOrganisation(organisationalUnitId, domainString)
		const ids = [...response.updatedChildIds, organisationalUnitId]
		ids.forEach(id => this.organisationalUnitCache.delete(id))
		return {
			...response,
			update: DomainUpdate.ADDED
		}
	}

	async removeDomain(organisationalUnitId: number, domainId: number, includeSubOrgs: boolean): Promise<DomainUpdateSuccess> {
		this.logger.info(`Removing domain with ID ${domainId} from Organisational Unit ${organisationalUnitId}.${includeSubOrgs ? '' : ' Not'} including sub organisations`)
		const response = await this.cslServiceClient.removeDomainFromOrganisation(organisationalUnitId, domainId, includeSubOrgs)
		const ids = [...response.updatedChildIds, organisationalUnitId]
		ids.forEach(id => this.organisationalUnitCache.delete(id))
		return {
			...response,
			update: DomainUpdate.REMOVED
		}
	}
}
