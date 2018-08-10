import {DefaultPageResults} from '../model/defaultPageResults'
import {RestService} from './restService'
import {LearningProviderFactory} from '../model/factory/learningProviderFactory'
import {LearningProvider} from '../model/learningProvider'

export class LearningProviderService {
	private _restService: RestService
	private _learningProviderFactory: LearningProviderFactory

	constructor(restService: RestService) {
		this._restService = restService
		this._learningProviderFactory = new LearningProviderFactory()
	}

	async listAll(page: number = 0, size: number = 10): Promise<DefaultPageResults<LearningProvider>> {
		const data = await this._restService.get(`/learning-provider/list?page=${page}&size=${size}`)

		data.results = (data.results || []).map(this._learningProviderFactory.create)

		const coursePageResults: DefaultPageResults<LearningProvider> = new DefaultPageResults()

		coursePageResults.size = data.size
		coursePageResults.results = data.results
		coursePageResults.page = data.page
		coursePageResults.totalResults = data.totalResults

		return coursePageResults
	}

	async create(learningProvider: LearningProvider): Promise<LearningProvider> {
		const data = await this._restService.post('/learning-provider/', learningProvider)
		return this._learningProviderFactory.create(data)
	}

	async get(learningProviderId: string): Promise<LearningProvider> {
		const data = await this._restService.get(`/learning-provider/${learningProviderId}`)

		return this._learningProviderFactory.create(data)
	}

	set courseFactory(value: LearningProviderFactory) {
		this._learningProviderFactory = value
	}
}
