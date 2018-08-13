import * as url from 'url'
import axios, {AxiosInstance, AxiosResponse} from 'axios'
import {LearningCatalogueConfig} from '../learningCatalogueConfig'
import {CancellationPolicy} from '../model/cancellationPolicy'

export class RestService {
	private _http: AxiosInstance
	config: LearningCatalogueConfig

	constructor(config: LearningCatalogueConfig) {
		this._http = axios.create({
			baseURL: config.url,
			auth: config.auth,
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: config.timeout,
		})

		this.config = config

		this.post = this.post.bind(this)
		this.get = this.get.bind(this)
	}

	async post(path: string, resource: any) {
		try {
			const response: AxiosResponse = await this._http.post(path, resource)

			return this.get(url.parse(response.headers.location).path!)
		} catch (e) {
			throw new Error(
				`Error with POST request: ${e} when posting ${JSON.stringify(resource)} to ${this.config.url}${path} `
			)
		}
	}

	async get(path: string) {
		try {
			return (await this._http.get(path)).data
		} catch (e) {
			throw new Error(`Error with GET request: ${e} when getting ${this.config.url}${path}`)
		}
	}

	async put(path: string, resource: CancellationPolicy) {
		try {
			await this._http.put(path, resource)

			return resource
		} catch (e) {
			throw new Error(`Error with PUT request: ${e} when putting ${this.config.url}${path}`)
		}
	}

	async delete(path: string) {
		try {
			return (await this._http.delete(path)).data
		} catch (e) {
			throw new Error(`Error with DELETE request: ${e} when deleting ${this.config.url}${path}`)
		}
	}

	set http(value: AxiosInstance) {
		this._http = value
	}
}
