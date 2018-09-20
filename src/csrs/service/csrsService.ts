import {RestService} from '../../learning-catalogue/service/restService'

export class CsrsService {
	restService: RestService

	constructor(restService: RestService) {
		this.restService = restService
	}

	async getOrganisations() {
		return await this.restService.get('organisations')
	}
}
