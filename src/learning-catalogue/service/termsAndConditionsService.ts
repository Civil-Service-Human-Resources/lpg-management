import {RestService} from './restService'
import {TermsAndConditionsFactory} from '../model/factory/termsAndConditionsFactory'
import {TermsAndConditions} from '../model/termsAndConditions'

export class TermsAndConditionsService {
	private _restService: RestService
	private _termsAndConditionsFactory: TermsAndConditionsFactory

	constructor(restService: RestService) {
		this._restService = restService
		this._termsAndConditionsFactory = new TermsAndConditionsFactory()
	}

	async create(learningProviderId: string, termsAndConditions: TermsAndConditions): Promise<TermsAndConditions> {
		const data = await this._restService.post(
			`/learning-providers/${learningProviderId}/terms-and-conditions`,
			termsAndConditions
		)
		return this._termsAndConditionsFactory.create(data)
	}

	async get(learningProviderId: string, termsAndConditionsId: string): Promise<TermsAndConditions> {
		const data = await this._restService.get(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`
		)

		return this._termsAndConditionsFactory.create(data)
	}

	async update(
		learningProviderId: string,
		termsAndConditionsId: string,
		termsAndConditions: TermsAndConditions
	): Promise<TermsAndConditions> {
		const data = await this._restService.put(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`,
			termsAndConditions
		)

		return data
	}

	async delete(learningProviderId: string, termsAndConditionsId: string) {
		const data = await this._restService.delete(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`
		)

		return data
	}

	set termsAndConditionsFactory(value: TermsAndConditionsFactory) {
		this._termsAndConditionsFactory = value
	}
}
