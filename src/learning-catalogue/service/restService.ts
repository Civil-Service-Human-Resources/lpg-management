import * as url from 'url'
import axios, {AxiosInstance, AxiosResponse} from 'axios'
import {LearningCatalogueConfig} from '../learningCatalogueConfig'

export class RestService {
	private _http: AxiosInstance
	config: LearningCatalogueConfig

	constructor(config: any) {
		this._http = axios.create({
			baseURL: config.url,
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: config.timeout,
		})

		this.config = config

		this.post = this.post.bind(this)
		this.get = this.get.bind(this)
	}

	async post(path: string, resource: any, accessToken: string) {
		try {
			const response: AxiosResponse = await this._http.post(path, resource, this.setRequestConfig(accessToken))

			return this.get(url.parse(response.headers.location).path!, accessToken)
		} catch (e) {
			throw new Error(
				`Error with POST request: ${e} when posting ${JSON.stringify(resource)} to ${this.config.url}${path}`
			)
		}
	}

	async get(path: string, accessToken: string) {
		try {
			return (await this._http.get(path, this.setRequestConfig(accessToken))).data
		} catch (e) {
			throw new Error(`Error with GET request: ${e} when getting ${this.config.url}${path}`)
		}
	}

	async put(path: string, resource: any, accessToken: string) {
		try {
			return (await this._http.put(path, resource, this.setRequestConfig(accessToken))).data
		} catch (e) {
			throw new Error(
				`Error with PUT request: ${e} when putting ${JSON.stringify(resource)} to ${this.config.url}${path}`
			)
		}
	}

	async delete(path: string, accessToken: string) {
		try {
			return await this._http.delete(path, this.setRequestConfig(accessToken))
		} catch (e) {
			throw new Error(`Error with DELETE request: ${e} when deleting ${this.config.url}${path}`)
		}
	}

	private setRequestConfig(accessToken: string) {
		return {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	}

	set http(value: AxiosInstance) {
		this._http = value
	}
}
