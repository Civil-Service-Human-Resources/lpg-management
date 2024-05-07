import * as url from 'url'
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import {Auth} from '../../identity/auth'
import { getLogger } from '../../utils/logger'
import { ResourceNotFoundError } from '../exception/resourceNotFoundError'
import {RestServiceConfig} from 'lib/http/restServiceConfig'

export class JsonRestService {
	logger = getLogger('JsonRestService')
	private _http: AxiosInstance
	config: any
	auth: Auth

	constructor(config: RestServiceConfig, auth: Auth) {
		this.logger.debug(`Constructing JsonRestService with config: ${JSON.stringify(config)}`)
		this.auth = auth
		this._http = axios.create({
			baseURL: config.url,
			timeout: config.timeout,
		})

		this._http.interceptors.request.use((conf: AxiosRequestConfig) => {
			const req = conf
			let logMsg = `Outgoing ${req.method} request to ${req.url}`
			if (req.data) {
				const stringedData = JSON.stringify(req.data)
				logMsg += ` Data: ${stringedData}`
			}
			if (req.params) {
				const stringedParams = JSON.stringify(req.params)
				logMsg += ` Params: ${stringedParams}`
			}
			if (config.detailedLogs) {
				this.logger.debug(logMsg)
			}
			return conf
		})

		this._http.interceptors.response.use((response: AxiosResponse): AxiosResponse<any> => {
			let logMsg = `Response from ${response.config.method} request to ${response.config.url}: ${response.status}`
			if (response.data) {
				let stringedData = JSON.stringify(response.data)
				logMsg += ` Data: ${stringedData}`
			}
			if (response.config.params) {
				const stringedParams = JSON.stringify(response.config.params)
				logMsg += ` Params: ${stringedParams}`
			}
			if (config.detailedLogs) {
				this.logger.debug(logMsg)
			}
			if (response.status === 404) {
				throw new ResourceNotFoundError(response.config.url!)
			}
			return response
		})

		this.config = config
		this.post = this.post.bind(this)
		this.get = this.get.bind(this)
	}

	protected getHeaders() {
		return {}
	}

	async postWithoutFollowing<ResponseType>(path: string, resource: any) {
		return await this._http.post<ResponseType>(path, resource, this.getHeaders())
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

	async getWithAuthAndConfig(path: string, config: any) {
		const headers: any = this.getHeaders()
		config.headers = headers.headers
		return await this.getWithConfig(path, config)
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

	async deleteWithAuthAndConfig(path: string, config: any) {
		const headers: any = this.getHeaders()
		config.headers = headers.headers
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
