import * as url from 'url'
import axios, {AxiosInstance, AxiosResponse} from 'axios'
import {Auth} from '../../identity/auth'

export class JsonRestService {
	private _http: AxiosInstance
	config: any
	auth: Auth

	constructor(config: any, auth: Auth) {
		this.auth = auth
		this._http = axios.create({
			baseURL: config.url,
			timeout: config.timeout,
		})

		this.config = config
		this.post = this.post.bind(this)
		this.get = this.get.bind(this)
	}

	protected getHeaders() {
		return {}
	}

	async post(path: string, resource: any) {
		try {
			const response: AxiosResponse = await this._http.post(path, resource, this.getHeaders())

			return this.get(url.parse(response.headers.location).path!)
		} catch (e) {
			throw new Error(
				`Error with POST request: ${e} when posting ${JSON.stringify(resource)} to ${this.config.url}${path}`
			)
		}
	}

	async get(path: string) {
		try {
			return (await this._http.get(path, this.getHeaders())).data
		} catch (e) {
			throw new Error(`Error with GET request: ${e} when getting ${this.config.url}${path}`)
		}
	}

	async put(path: string, resource: any) {
		try {
			return (await this._http.put(path, resource, this.getHeaders())).data
		} catch (e) {
			throw new Error(
				`Error with PUT request: ${e} when putting ${JSON.stringify(resource)} to ${this.config.url}${path}`
			)
		}
	}

	async delete(path: string) {
		try {
			return await this._http.delete(path, this.getHeaders())
		} catch (e) {
			throw new Error(`Error with DELETE request: ${e} when deleting ${this.config.url}${path}`)
		}
	}

	set http(value: AxiosInstance) {
		this._http = value
	}
}
