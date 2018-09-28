import {OauthRestService} from '../../lib/http/oauthRestService'

const jsonpath = require('jsonpath')

export class CsrsService {
	restService: OauthRestService
	departmentCodeToNameMapping: any

	constructor(restService: OauthRestService) {
		this.restService = restService
	}

	async getOrganisations() {
		return await this.restService.get('organisations')
	}

	async getAreasOfWork() {
		return await this.restService.get('professions')
	}

	async getGrades() {
		return await this.restService.get('grades')
	}

	async getInterests() {
		return await this.restService.get('interests')
	}

	async getDepartmentCodeToNameMapping() {
		if (Object.is(this.departmentCodeToNameMapping, undefined)) {
			const organisations = jsonpath.query(await this.getOrganisations(), '$._embedded.organisations.*')
			this.departmentCodeToNameMapping = {}

			for (let organisation of organisations) {
				this.departmentCodeToNameMapping[organisation.code] = organisation.name
			}
		}
		return this.departmentCodeToNameMapping
	}
}
