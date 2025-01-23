import * as url from 'url'
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import {Auth} from '../../identity/auth'
import { getLogger } from '../../utils/logger'
import {RestServiceConfig} from '../http/restServiceConfig'
import {ReportResponse} from '../../csl-service/model/ReportResponse'
import {DownloadableFile} from '../../csl-service/model/DownloadableFile'
import {HttpException} from '../exception/HttpException'

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

		this.config = config
		this.post = this.post.bind(this)
		this.get = this.get.bind(this)
	}

	async makeRawRequest<T>(req: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		const fullUrl = `${this._http.defaults.baseURL}${req.url}`
		if (this.config.detailedLogs) {
			let logMsg = `${req.method} request to ${fullUrl}`

			if (req.data) {
				const stringedData = JSON.stringify(req.data)
				logMsg += ` Data: ${stringedData}`
			}
			if (req.params) {
				const stringedParams = JSON.stringify(req.params)
				logMsg += ` Params: ${stringedParams}`
			}
			this.logger.debug(logMsg)
		}
		try {
			const response = await this._http.request<T>(req)
			if (this.config.detailedLogs) {
				let logMsg = `Response from ${response.config.method} request to ${response.config.url}: ${response.status}`
				const contentType = response.headers['content-type']
				if (response.data && contentType && contentType === 'application/json') {
					let stringedData = JSON.stringify(response.data)
					logMsg += ` Data: ${stringedData}`
				}
				if (response.config.params) {
					const stringedParams = JSON.stringify(response.config.params)
					logMsg += ` Params: ${stringedParams}`
				}
				this.logger.debug(logMsg)
			}
			return response
		} catch (e) {
			let str = `${req.method} request to ${fullUrl} failed`
			let respCode: number = 0
			if (e.response) {
				respCode = e.response.status
				str = `${str} with a status ${e.response.status}`
				const contentType = e.response.headers['content-type']
				if (e.response.data && contentType && contentType === 'application/json') {
					const data = JSON.stringify(e.response.data)
					str = `${str}. data: ${data}`
				}
			} else {
				str = `${str} with exception ${e}`
			}
			this.logger.error(str)
			if (respCode >= 400) {
				throw new HttpException(fullUrl, respCode)
			}
			throw e
		}
	}

	async makeRawAuthenticatedRequest<T>(req: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		const headers: any = this.getHeaders()
		req.headers = headers.headers
		return this.makeRawRequest(req)
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

	async postRequest<T>(req: AxiosRequestConfig) {
		return await this.makeRawAuthenticatedRequest<T>({method: 'POST', ...req})
	}

	async getRequest<T>(req: AxiosRequestConfig) {
		return await this.makeRawAuthenticatedRequest<T>({method: 'GET', ...req})
	}

	/**
	 * @deprecated Prefer getRequest over this, as this does not include detailed logging
	 * @param path
	 */
	async get(path: string) {
		return (await this._http.get(path, this.getHeaders())).data
	}

	async getFile(path: string) {
		let file: DownloadableFile | null = null
		let status: number
		try {
			const resp = await this.getRequest<Buffer>({
				url: path,
				responseType: 'arraybuffer',
			})
			status = resp.status
			const contentDisposition = resp.headers['content-disposition']
			if (!contentDisposition || contentDisposition.indexOf('attachment') === -1) {
				this.logger.error(`content-disposition header was not found on report download for path ${path}`)
				status = 404
			} else {
				const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
				const matches = filenameRegex.exec(contentDisposition);
				if (matches != null && matches[1]) {
					const filename = matches[1].replace(/['"]/g, '');
					file = new DownloadableFile(filename, Buffer.from(resp.data))
				} else {
					this.logger.error(`filename header was not found on report download for path ${path}`)
					status = 404
				}
			}
		} catch (e) {
			if (e instanceof HttpException) {
				status = e.statusCode
			} else {
				throw e
			}
		}
		return new ReportResponse(status, file)
	}

	async getWithAuthAndConfig(path: string, config: AxiosRequestConfig) {
		const headers: any = this.getHeaders()
		config.headers = headers.headers
		return await this.getWithConfig(path, config)
	}

	async getWithConfig(path: string, config: AxiosRequestConfig) {
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
