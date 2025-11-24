import {DeleteOrganisationResponse} from '../../csl-service/model/organisationalUnit/deleteOrganisationResponse'
import {plainToInstance} from 'class-transformer'
import {DomainUpdateSuccessResponse} from '../model/page/domainUpdateSuccess'
import {OrganisationalUnitPageModel} from '../model/organisationalUnitPageModel'
import {OrganisationalUnit} from '../model/organisationalUnit'
import {AxiosResponse} from 'axios'
import {OauthRestService} from 'lib/http/oauthRestService'
import {
	GetOrganisationsFormattedParams
} from '../../csl-service/model/organisationalUnit/getOrganisationsFormattedParams'
import {
	FormattedOrganisationListResponse
} from '../../csl-service/model/organisationalUnit/FormattedOrganisationListResponse'
import {OrganisationalUnitTree} from '../../csl-service/model/organisationalUnit/organisationalUnitTree'
import {EditAgencyToken} from '../../controllers/organisationalUnit/model/editAgencyToken'

export class OrganisationalUnitClient {

	private ORGANISATIONS_URL = "/organisations"
	private DOMAINS_URL = (organisationalUnitId: number) => `/organisations/${organisationalUnitId}/domains`
	private AGENCY_TOKENS_URL = (organisationalUnitId: number) => `/organisations/${organisationalUnitId}/agency-token`
	private FORMATTED_LIST_URL = `${this.ORGANISATIONS_URL}/formatted_list`
	private TREE_URL = `${this.ORGANISATIONS_URL}/overview-tree`

	constructor(private readonly _http: OauthRestService, ) { }

	private async buildOrganisationalUnitResponse(response: Promise<AxiosResponse<OrganisationalUnit>>) {
		return plainToInstance(OrganisationalUnit, (await response).data)
	}

	async getFormattedOrganisationList(params?: GetOrganisationsFormattedParams): Promise<FormattedOrganisationListResponse> {
		const response = await this._http.getRequest({
			url: this.FORMATTED_LIST_URL,
			params
		})
		return plainToInstance(FormattedOrganisationListResponse, response.data)
	}

	async addDomain(id: number, domain: string): Promise<DomainUpdateSuccessResponse> {
		return (await this._http.postRequest<DomainUpdateSuccessResponse>({
			url: this.DOMAINS_URL(id),
			data: {
				domain
			}
		})).data
	}

	async removeDomain(id: number, domainId: number, includeSubOrgs: boolean): Promise<DomainUpdateSuccessResponse> {
		return (await this._http.deleteRequest<DomainUpdateSuccessResponse>({
			url: `${this.DOMAINS_URL(id)}/${domainId}`,
			params: {
				includeSubOrgs
			}
		})).data
	}

	async update(id: number, data: OrganisationalUnitPageModel): Promise<OrganisationalUnit> {
		return await this.buildOrganisationalUnitResponse(this._http.putRequest<OrganisationalUnit>({
			url: `${this.ORGANISATIONS_URL}/${id}`,
			data
		}));
	}

	async get(id: number): Promise<OrganisationalUnit> {
		return await this.buildOrganisationalUnitResponse(this._http.getRequest<OrganisationalUnit>({
			url: `${this.ORGANISATIONS_URL}/${id}`
		}));
	}

	async create(data: OrganisationalUnitPageModel): Promise<OrganisationalUnit> {
		return await this.buildOrganisationalUnitResponse(this._http.postRequest<OrganisationalUnit>({
			url: this.ORGANISATIONS_URL,
			data
		}));
	}

	async delete(id: number) {
		const response = await this._http.deleteRequest<DeleteOrganisationResponse>({
			url: `${this.ORGANISATIONS_URL}/${id}`
		})
		return plainToInstance(DeleteOrganisationResponse, response.data)
	}

	async createAgencyToken(organisationalUnitId: number, data: EditAgencyToken) {
		return await this.buildOrganisationalUnitResponse(this._http.postRequest<OrganisationalUnit>({
			url: this.AGENCY_TOKENS_URL(organisationalUnitId),
			data
		}));
	}

	async updateAgencyToken(organisationalUnitId: number, data: EditAgencyToken) {
		return await this.buildOrganisationalUnitResponse(this._http.putRequest<OrganisationalUnit>({
			url: this.AGENCY_TOKENS_URL(organisationalUnitId),
			data
		}));
	}

	async deleteAgencyToken(organisationalUnitId: number) {
		await this.buildOrganisationalUnitResponse(this._http.deleteRequest<OrganisationalUnit>({
			url: this.AGENCY_TOKENS_URL(organisationalUnitId)
		}));
	}

	async getTree() {
		return plainToInstance(OrganisationalUnitTree, (await this._http.getRequest<OrganisationalUnitTree>({
			url: this.TREE_URL
		})).data)
	}

}
