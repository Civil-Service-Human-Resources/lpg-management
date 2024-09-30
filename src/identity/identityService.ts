import {AxiosInstance} from 'axios'
import * as config from '../config'

export class IdentityService {
	http: AxiosInstance

	constructor(http: AxiosInstance) {
		this.http = http
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
