import { plainToInstance } from 'class-transformer';

import * as config from '../../config';
import { OauthRestService } from '../../lib/http/oauthRestService';
import { OrganisationalUnit } from '../model/organisationalUnit';
import { OrganisationalUnitPageModel } from '../model/organisationalUnitPageModel';
import {
    GetOrganisationRequestOptions, GetOrganisationsRequestOptions
} from './getOrganisationsRequestOptions';
import { GetOrganisationsResponse } from './getOrganisationsResponse';

export class OrganisationalUnitClient {

    constructor(private readonly _http: OauthRestService) { }

    BASE_URL = "/organisationalUnits"
    V2_BASE_URL = "/v2/organisationalUnits"
    CSRS_URL = config.REGISTRY_SERVICE.url

    async getOrganisationalUnits(options: GetOrganisationsRequestOptions): Promise<OrganisationalUnit[]> {
        const resp: GetOrganisationsResponse = await this._http.getWithAuthAndConfig(
            this.V2_BASE_URL, {
                params: options
            }
        )
        const responseData = plainToInstance(GetOrganisationsResponse, resp)
        return responseData.organisationalUnits
    }

    async getOrganisationalUnit(organisationalUnitId: number, options: GetOrganisationRequestOptions): Promise<OrganisationalUnit> {
        const resp: OrganisationalUnit = await this._http.getWithAuthAndConfig(
            `${this.V2_BASE_URL}/${organisationalUnitId}`, {
                params: options
            }
        )
        const responseData = plainToInstance(OrganisationalUnit, resp)
        return responseData
    }

    async create(organisationalUnit: OrganisationalUnitPageModel): Promise<OrganisationalUnit> {
        const respData: OrganisationalUnit = (await this._http.postWithoutFollowing(this.BASE_URL, organisationalUnit)).data
        return plainToInstance(OrganisationalUnit, respData)
    }

    async update(organisationalUnitId: number, organisationalUnit: OrganisationalUnitPageModel): Promise<void> {
        const parent = organisationalUnit.parentId ? `${this.CSRS_URL}${this.BASE_URL}/${organisationalUnit.parentId}` : null
        console.log(organisationalUnit.name)
        await this._http.patch(`${this.BASE_URL}/${organisationalUnitId}`, {
            code: organisationalUnit.code,
            name: organisationalUnit.name,
            abbreviation: organisationalUnit.abbreviation,
            parent: parent
        })
    }

    async delete(organisationalUnitId: number) {
        await this._http.delete(`${this.BASE_URL}/${organisationalUnitId}`)
    }

    async createAgencyToken(organisationalUnitId: number, agencyToken: any): Promise<void> {
        await this._http.post(`${this.BASE_URL}/${organisationalUnitId}/agencyToken`, agencyToken)
    }

    async updateAgencyToken(organisationalUnitId: number, agencyToken: any): Promise<void> {
		await this._http.patch(`${this.BASE_URL}/${organisationalUnitId}/agencyToken`, agencyToken)
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		await this._http.delete(`${this.BASE_URL}/${organisationalUnitId}/agencyToken`)
	}

}