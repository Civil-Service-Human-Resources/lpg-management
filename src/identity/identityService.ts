import {AxiosInstance} from 'axios'
import {Identity} from './identity'
import * as config from '../config'
import { CsrsService } from 'src/csrs/service/csrsService'

export class IdentityService {
	http: AxiosInstance
	csrsService: CsrsService

	constructor(http: AxiosInstance) {
		this.http = http
	}

	async getDetails(token: string) {
		const response = await this.http.get(config.AUTHENTICATION.endpoints.resolve, {
			baseURL: config.AUTHENTICATION.authenticationServiceUrl,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		let organisationalUnit = (await this.csrsService.getCivilServant()).organisationalUnit
		
		return new Identity(response.data.uid, response.data.username, response.data.roles, token, organisationalUnit)
	}

	async logout(token: string) {
		await this.http.get(config.AUTHENTICATION.endpoints.logout, {
			baseURL: config.AUTHENTICATION.authenticationServiceUrl,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
	}
}
