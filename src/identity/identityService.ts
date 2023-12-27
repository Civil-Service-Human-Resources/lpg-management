import {AxiosInstance} from 'axios'
import {Identity} from './identity'
import * as config from '../config'

export class IdentityService {
	http: AxiosInstance

	constructor(http: AxiosInstance) {
		this.http = http
	}

	async getDetails(token: string) {
		const response = await this.http.get(config.AUTHENTICATION.identityResolveEndPoint, {
			baseURL: config.AUTHENTICATION.authenticationServiceUrl,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		const identity = new Identity(response.data.uid, response.data.roles, token)

		return identity
	}

	async logout(token: string) {
		await this.http.get(config.AUTHENTICATION.logoutEndPoint, {
			baseURL: config.AUTHENTICATION.authenticationServiceUrl,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
	}
}
