import {EntityService} from '../learning-catalogue/service/entityService'
import {OrganisationalUnit} from './model/organisationalUnit'
import {OauthRestService} from '../lib/http/oauthRestService'
import {Auth} from '../identity/auth'
import {OrganisationalUnitFactory} from './model/organisationalUnitFactory'
import {DefaultPageResults} from '../learning-catalogue/model/defaultPageResults'
import {CsrsConfig} from './csrsConfig'

export class Csrs {
	private _organisationalUnitService: EntityService<OrganisationalUnit>
	private _restService: OauthRestService

	constructor(config: CsrsConfig, auth: Auth) {
		this._restService = new OauthRestService(config, auth)
		this._organisationalUnitService = new EntityService<OrganisationalUnit>(this._restService, new OrganisationalUnitFactory())
	}

	async listOrganisationalUnits(): Promise<DefaultPageResults<OrganisationalUnit>> {
		return await this._organisationalUnitService.listAll(`/organisationalUnits/tree`)
	}

	async listOrganisationalUnitsForTypehead(): Promise<DefaultPageResults<OrganisationalUnit>> {
		return await this._organisationalUnitService.listAllAsRawData(`/organisationalUnits/flat`)
	}

	async createOrganisationalUnit(organisationalUnit: OrganisationalUnit): Promise<OrganisationalUnit> {
		return await this._organisationalUnitService.create(`/organisationalUnits/`, organisationalUnit)
	}

	async getOrganisationalUnit(organisationalUnitId: string): Promise<OrganisationalUnit> {
		return await this._organisationalUnitService.get(`/organisationalUnits/${organisationalUnitId}`)
	}

	async deleteOrganisationalUnit(organisationalUnitId: string): Promise<void> {
		return await this._organisationalUnitService.delete(`/organisationalUnits/${organisationalUnitId}`)
	}

	set organisationalUnitService(value: EntityService<OrganisationalUnit>) {
		this._organisationalUnitService = value
	}
}
