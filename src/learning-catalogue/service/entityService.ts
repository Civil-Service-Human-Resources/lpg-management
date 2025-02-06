import {Factory} from '../model/factory/factory'
import {DefaultPageResults} from '../model/defaultPageResults'
import {OauthRestService} from '../../lib/http/oauthRestService'

export class EntityService<T> {
	private _restService: OauthRestService
	private _factory: Factory<T>

	constructor(restService: OauthRestService, factory: Factory<T>) {
		this._restService = restService
		this._factory = factory
	}

	async listAllWithPagination(path: string): Promise<DefaultPageResults<T>> {
		const data = await this._restService.get(path)

		data.results = (data.results || []).map(this._factory.create)

		const pageResults: DefaultPageResults<T> = new DefaultPageResults()

		pageResults.size = data.size
		pageResults.results = data.results
		pageResults.page = data.page
		pageResults.totalResults = data.totalResults

		return pageResults
	}

	async listAll(path: string): Promise<DefaultPageResults<T>> {
		const data = await this._restService.get(path)

		data.results = (data || []).map(this._factory.create)

		return data.results
	}

	async listAllAsRawData(path: string): Promise<DefaultPageResults<T>> {
		const data = await this._restService.get(path)

		return data
	}

	async create(path: string, entity: any): Promise<T> {
		const data = await this._restService.post(path, entity)
		return this._factory.create(data)
	}

	async createWithoutFollowing(path: string, entity: any): Promise<T> {
		const data = await this._restService.postWithoutFollowing(path, entity)
		return this._factory.create(data)
	}

	async get(path: string): Promise<T> {
		const response = await this._restService.getRequest<T>({url: path})
		return this._factory.create(response.data)
	}

	async update(path: string, entity: any): Promise<T> {
		return await this._restService.put(path, entity)
	}

	async patch(path: string, entity: any): Promise<T> {
		return await this._restService.patch(path, entity)
	}

	async delete(path: string): Promise<void> {
		await this._restService.delete(path)
	}

	set factory(value: Factory<T>) {
		this._factory = value
	}
}
