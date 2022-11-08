import { plainToInstance } from "class-transformer";
import * as config from "../../config"
import { OauthRestService } from "../../lib/http/oauthRestService";
import { OrganisationalUnit } from "../model/organisationalUnit";
import { OrganisationalUnitPageModel } from "../model/organisationalUnitPageModel";
import { GetOrganisationsRequestOptions } from "./getOrganisationsRequestOptions";
import { GetOrganisationsResponse } from "./getOrganisationsResponse";

export class OrganisationalUnitClient {

    constructor(private readonly _http: OauthRestService) { }

    BASE_URL = "/organisationalUnits"
    CSRS_URL = config.REGISTRY_SERVICE.url

    async getOrgsTree(): Promise<OrganisationalUnit[]> {
        const respData: OrganisationalUnit[] = await this._http.get(`${this.BASE_URL}/tree`)
        return plainToInstance(OrganisationalUnit, respData)
    }

    async get(options: GetOrganisationsRequestOptions): Promise<OrganisationalUnit[]> {
        const resp: GetOrganisationsResponse = await this._http.getWithConfig(
            `${this.BASE_URL}/v2`, {
                params: options
            }
        )
        console.log(resp)
        const responseData = plainToInstance(GetOrganisationsResponse, resp)
        return responseData.organisationalUnits
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