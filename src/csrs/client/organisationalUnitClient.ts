import { plainToInstance } from 'class-transformer';

import * as config from '../../config';
import { OauthRestService } from '../../lib/http/oauthRestService';
import { AgencyToken } from '../model/agencyToken';
import { OrganisationalUnit } from '../model/organisationalUnit';
import { OrganisationalUnitPageModel } from '../model/organisationalUnitPageModel';
import {
    GetOrganisationRequestOptions, GetOrganisationsRequestOptions
} from './getOrganisationsRequestOptions';
import { GetOrganisationsResponse } from './getOrganisationsResponse';
import {AddDomainToOrgResponse} from './addDomainToOrgResponse'

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
        if (response.totalElements >= 1) {
            const totalPages = Math.ceil(response.totalElements / this.MAX_PER_PAGE)
            const requests: any[] = []
            for (let page = 0; page < totalPages; page++) {
                requests.push(this.getOrganisationalUnits({size: this.MAX_PER_PAGE, page})
                .then((data) => {
                    orgs.push(...data.content)
                }))
            }
            await Promise.all(requests)
        }
        return orgs
    }

    async getSpecificOrganisationalUnits(ids: number[]): Promise<OrganisationalUnit[]> {
        const orgs: OrganisationalUnit[] = []
        const totalPages = Math.ceil(ids.length / this.MAX_PER_PAGE)
        const requests: any[] = []
        for (let page = 0; page < totalPages; page++) {
            requests.push(this.getOrganisationalUnits({size: this.MAX_PER_PAGE, page, ids: ids.join(",")})
                .then((data) => {
                    orgs.push(...data.content)
                }))
        }
        await Promise.all(requests)
        return orgs
    }

    async getOrganisationalUnits(options: GetOrganisationsRequestOptions): Promise<GetOrganisationsResponse> {
        const resp: GetOrganisationsResponse = await this._http.getWithAuthAndConfig(
            this.V2_BASE_URL, {
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
		const parent = organisationalUnit.parentId ? `${this.CSRS_URL}${this.BASE_URL}/${organisationalUnit.parentId}` : null
        const respData: OrganisationalUnit = (await this._http.postWithoutFollowing(this.BASE_URL, {
            code: organisationalUnit.code,
            name: organisationalUnit.name,
            abbreviation: organisationalUnit.abbreviation,
            parent: parent
        })).data
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

    async createAgencyToken(organisationalUnitId: number, agencyToken: any): Promise<AgencyToken> {
        const response = await this._http.post(`${this.BASE_URL}/${organisationalUnitId}/agencyToken`, agencyToken)
        return plainToInstance(AgencyToken, response)
    }

    async updateAgencyToken(organisationalUnitId: number, agencyToken: any): Promise<AgencyToken> {
		const resp = await this._http.patch(`${this.BASE_URL}/${organisationalUnitId}/agencyToken`, agencyToken)
        return plainToInstance(AgencyToken, resp)
	}

	async deleteAgencyToken(organisationalUnitId: number): Promise<void> {
		await this._http.delete(`${this.BASE_URL}/${organisationalUnitId}/agencyToken`)
	}

	async addDomain(organisationalUnitId: number, domain: string): Promise<AddDomainToOrgResponse> {
        const response = await this._http.postWithoutFollowing(`${this.BASE_URL}/${organisationalUnitId}/domains`, {domain})
        return  plainToInstance(AddDomainToOrgResponse, response.data)
	}
}
