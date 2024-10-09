import {EntityService} from '../learning-catalogue/service/entityService'
import {OauthRestService} from '../lib/http/oauthRestService'
import {Auth} from './auth'
import {AgencyTokenCapacityUsed} from './model/AgencyTokenCapacityUsed'
import {AgencyTokenCapacityUsedFactory} from './model/AgencyTokenCapacityUsedFactory'
import {RestServiceConfig} from 'lib/http/restServiceConfig'

export class AgencyTokenCapacityUsedHttpService {
	private _agencyTokenCapacityUsedHttpService: EntityService<AgencyTokenCapacityUsed>
	private _restService: OauthRestService

	constructor(config: RestServiceConfig, auth: Auth) {
		this._restService = new OauthRestService(config, auth)
		this._agencyTokenCapacityUsedHttpService = new EntityService<AgencyTokenCapacityUsed>(this._restService, new AgencyTokenCapacityUsedFactory())
	}

	async getCapacityUsed(uid: string): Promise<AgencyTokenCapacityUsed> {
		return await this._agencyTokenCapacityUsedHttpService.get(`/agency/${uid}`)
	}

	set agencyTokenCapacityUsedService(value: EntityService<AgencyTokenCapacityUsed>) {
		this._agencyTokenCapacityUsedHttpService = value
	}
}
