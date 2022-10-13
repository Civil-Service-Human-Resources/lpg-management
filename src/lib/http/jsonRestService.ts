import * as url from 'url'
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import {Auth} from '../../identity/auth'
import { getLogger } from '../../utils/logger'

export class JsonRestService {
	logger = getLogger('JsonRestService')
	private _http: AxiosInstance
	config: any
	auth: Auth

	constructor(config: any, auth: Auth) {
		this.auth = auth
		this._http = axios.create({
			baseURL: config.url,
			timeout: config.timeout,
		})

		this._http.interceptors.request.use((conf: AxiosRequestConfig) => {
			const req = conf
			let logMsg = `${req.method} request to ${req.url}.`
			if (req.data) {
				const stringedData = JSON.stringify(req.data)
				logMsg += ` Data: ${stringedData}`
			}
			this.logger.debug(logMsg)
			return conf
		})

		this.config = config
		this.post = this.post.bind(this)
		this.get = this.get.bind(this)
	}

	protected getHeaders() {
		return {}
	}

	async postWithoutFollowing(path: string, resource: any) {
		return await this._http.post(path, resource, this.getHeaders())
	}

	async postWithoutFollowingWithConfig(path: string, resource: any, config: any) {
		return await this._http.post(path, resource, config)
	}

	async post(path: string, resource: any) {
		const response: AxiosResponse = await this._http.post(path, resource, this.getHeaders())

		return this.get(url.parse(response.headers.location).path!)
	}

	async get(path: string) {
		return (await this._http.get(path, this.getHeaders())).data
	}

	async getWithConfig(path: string, config: any) {
		return (await this._http.get(path, config)).data
	}

	async put(path: string, resource: any) {
		return (await this._http.put(path, resource, this.getHeaders())).data
	}

	async putWithConfig(path: string,resource: any, config: any) {
		return (await this._http.put(path, resource, config))
	}

	async deleteWithConfig(path: string, config: any) {
		return await this._http.delete(path, config)
	}

	async delete(path: string) {
		return await this._http.delete(path, this.getHeaders())
	}

	async patch(path: string, resource: any) {
		return (await this._http.patch(path, resource, this.getHeaders())).data
	}

	async patchWithJsonPatch(path: string, resource: any) {
		let headersObj: any = this.getHeaders()
		headersObj.headers['Content-Type'] = 'application/json-patch+json'
		return (await this._http.patch(path, resource, headersObj)).data
	}

	set http(value: AxiosInstance) {
		this._http = value
	}
}
