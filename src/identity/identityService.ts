import {AxiosInstance} from 'axios'
import {Identity} from './identity'
import * as config from '../config'

export class IdentityService {
	http: AxiosInstance

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
		return new Identity(response.data.uid, response.data.username, response.data.roles, token)
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
