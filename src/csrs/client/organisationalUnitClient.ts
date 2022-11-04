import { plainToInstance } from "class-transformer";
import { OauthRestService } from "../../lib/http/oauthRestService";
import { OrganisationalUnit } from "../model/organisationalUnit";
import { OrganisationalUnitPageModel } from "../model/organisationalUnitPageModel";

export class OrganisationalUnitClient {

    constructor(private readonly _http: OauthRestService) { }

    BASE_URL = "/organisationalUnits"
    AGENCY_BASE_URL = "/agency"

    async getOrgsTree(): Promise<OrganisationalUnit[]> {
        const respData: OrganisationalUnit[] = await this._http.get(`${this.BASE_URL}/tree`)
        return plainToInstance(OrganisationalUnit, respData)
    }

    async getOrgsFlat(): Promise<OrganisationalUnit[]> {
        const respData: OrganisationalUnit[] = await this._http.get(`${this.BASE_URL}/flat`)
        return plainToInstance(OrganisationalUnit, respData)
    }

    async getOrganisation(organisationalUnitId: number): Promise<OrganisationalUnit> {
        const respData: OrganisationalUnit = await this._http.get(`${this.BASE_URL}/${organisationalUnitId}`)
        return plainToInstance(OrganisationalUnit, respData)
    }

    async create(organisationalUnit: OrganisationalUnitPageModel): Promise<OrganisationalUnit> {
        const respData: OrganisationalUnit = (await this._http.postWithoutFollowing(this.BASE_URL, organisationalUnit)).data
        return plainToInstance(OrganisationalUnit, respData)
    }

    async update(organisationalUnitId: number, organisationalUnit: OrganisationalUnitPageModel): Promise<void> {
        await this._http.patch(`${this.BASE_URL}/${organisationalUnitId}`, organisationalUnit)
    }

    async delete(organisationalUnitId: number) {
        await this._http.delete(`${this.BASE_URL}/${organisationalUnitId}`)
    }

    async getAgencyTokenCapacityUsed(agencyTokenUid: string): Promise<string> {
        const resp = await this._http.get(`${this.AGENCY_BASE_URL}/${agencyTokenUid}`)
        return resp.data
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