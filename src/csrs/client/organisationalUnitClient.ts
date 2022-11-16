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

    private BASE_URL = "/organisationalUnits"
    private V2_BASE_URL = `/v2${this.BASE_URL}`
    private CSRS_URL = config.REGISTRY_SERVICE.url
    private MAX_PER_PAGE = 200

    async getAllOrganisationalUnits(): Promise<OrganisationalUnit[]> {
        const orgs: OrganisationalUnit[] = []
        const response = await this.getOrganisationalUnits({
            size: 1,
            page: 0
        })
        if (response.page.totalPages >= 1) {
            const requests: any[] = []
            for (let page = 0; page < response.page.totalPages; page++) {
                requests.push(this.getOrganisationalUnits({size: this.MAX_PER_PAGE, page})
                .then((data) => {
                    orgs.push(...data.embedded.organisationalUnits)
                }))
            }
            await Promise.all(requests)
        }
        return orgs
    }

    async getOrganisationalUnits(options: GetOrganisationsRequestOptions): Promise<GetOrganisationsResponse> {
        const resp: GetOrganisationsResponse = await this._http.getWithAuthAndConfig(
            this.BASE_URL, {
                params: options
            }
        )
        return plainToInstance(GetOrganisationsResponse, resp)
    }

    async getOrganisationalUnit(organisationalUnitId: number, options?: GetOrganisationRequestOptions): Promise<OrganisationalUnit> {
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