import {RestService} from './restService'
import {Factory} from '../model/factory/factory'
import {DefaultPageResults} from '../model/defaultPageResults'

export class EntityService<T> {
	private _restService: RestService
	private _factory: Factory<T>

	constructor(restService: RestService, factory: Factory<T>) {
		this._restService = restService
		this._factory = factory
	}

	async listAll(path: string, accessToken: string): Promise<DefaultPageResults<T>> {
		const data = await this._restService.get(path, accessToken)

		data.results = (data.results || []).map(this._factory.create)

		const pageResults: DefaultPageResults<T> = new DefaultPageResults()

		pageResults.size = data.size
		pageResults.results = data.results
		pageResults.page = data.page
		pageResults.totalResults = data.totalResults

		return pageResults
	}

	async create(path: string, entity: any, accessToken: string): Promise<T> {
		const data = await this._restService.post(path, entity, accessToken)
		return this._factory.create(data)
	}

	async get(path: string, accessToken: string): Promise<T> {
		const data = await this._restService.get(path, accessToken)

		return this._factory.create(data)
	}

	async update(path: string, entity: any, accessToken: string): Promise<T> {
		const data = await this._restService.put(path, entity, accessToken)

		return this._factory.create(data)
	}

	async delete(path: string, accessToken: string): Promise<void> {
		await this._restService.delete(path, accessToken)
	}

	set factory(value: Factory<T>) {
		this._factory = value
	}
}
