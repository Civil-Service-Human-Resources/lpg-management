import {EntityService} from '../learning-catalogue/service/entityService'
import {OauthRestService} from '../lib/http/oauthRestService'
import {Auth} from '../identity/auth'
import {AgencyToken} from './model/agencyToken'
import {AgencyTokenFactory} from './model/agencyTokenFactory'
import {RestServiceConfig} from 'lib/http/restServiceConfig'

export class AgencyTokenHttpService {
	private _agencyTokenHttpService: EntityService<AgencyToken>
	private _restService: OauthRestService

	constructor(config: RestServiceConfig, auth: Auth) {
		this._restService = new OauthRestService(config, auth)
		this._agencyTokenHttpService = new EntityService<AgencyToken>(this._restService, new AgencyTokenFactory())
	}

	async getAgencyToken(organisationalUnitId: string): Promise<AgencyToken> {
		return await this._agencyTokenHttpService.get(`/organisationalUnits/${organisationalUnitId}/agencyToken`)
	}

	set agencyTokenHttpService(value: EntityService<AgencyToken>) {
		this._agencyTokenHttpService = value
	}
}
