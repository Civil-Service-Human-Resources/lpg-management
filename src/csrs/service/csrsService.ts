import {OauthRestService} from '../../lib/http/oauthRestService'

const jsonpath = require('jsonpath')

export class CsrsService {
	restService: OauthRestService

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
		const organisations = jsonpath.query(await this.getOrganisations(), '$._embedded.organisations.*')
		const codeToName: any = {}

		for (let organisation of organisations) {
			codeToName[organisation.code] = organisation.name
		}

		return codeToName
	}
}
