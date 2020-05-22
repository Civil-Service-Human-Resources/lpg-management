import {OrganisationalUnitFactory} from '../model/organisationalUnitFactory'
import {Csrs} from '../index'
import * as log4js from 'log4js'
import {AgencyTokenCapacityUsedHttpService} from "../../identity/agencyTokenCapacityUsedHttpService";

const logger = log4js.getLogger('csrs/service/OrganisationalUnitService')

export class OrganisationalUnitService {
	csrs: Csrs
	organisationalUnitFactory: OrganisationalUnitFactory
	agencyTokenCapacityUsedHttpService: AgencyTokenCapacityUsedHttpService

	constructor(csrs: Csrs, organisationalUnitFactory: OrganisationalUnitFactory, agencyTokenCapacityUsedHttpService: AgencyTokenCapacityUsedHttpService) {
		this.csrs = csrs
		this.organisationalUnitFactory = organisationalUnitFactory
		this.agencyTokenCapacityUsedHttpService = agencyTokenCapacityUsedHttpService
	}

	async getOrganisationalUnit(uri: string) {
		let organisationalUnit: any
		let parent: any

		organisationalUnit = await this.csrs.getOrganisationalUnit(uri).catch(error => {
			throw error
		})

		parent = await this.csrs.getOrganisationalUnit(`${organisationalUnit.id}/parent`).catch(error => {
			if (error.response.status == 404) {
				logger.debug(`Organisation ${organisationalUnit.id} has no parent`)
			} else {
				throw error
			}
		})

		/*if(organisationalUnit.agencyToken !== undefined) {
			// if org has an agency token get the capacity used
			const response = await this.agencyTokenCapacityUsedHttpService.getCapacityUsed(organisationalUnit.agencyToken.uid)
			organisationalUnit.agencyToken.capacityUsed = response.capacityUsed
		}
*/
		const data = {
			id: organisationalUnit.id,
			name: organisationalUnit.name,
			code: organisationalUnit.code,
			abbreviation: organisationalUnit.abbreviation,
			parent: parent,
			agencyToken: organisationalUnit.agencyToken,
		}

		if(data.agencyToken !== undefined) {
			// if org has an agency token get the capacity used
			const response = await this.agencyTokenCapacityUsedHttpService.getCapacityUsed(data.agencyToken.uid)
			//organisationalUnit.agencyToken.capacityUsed = response.capacityUsed
			data.agencyToken.capacityUsed = response.capacityUsed
		}

		return this.organisationalUnitFactory.create(data)
	}
}
