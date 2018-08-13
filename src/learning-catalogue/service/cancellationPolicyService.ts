import {RestService} from './restService'
import {CancellationPolicyFactory} from '../model/factory/cancellationPolicyFactory'
import {CancellationPolicy} from '../model/cancellationPolicy'

export class CancellationPolicyService {
	private _restService: RestService
	private _cancellationPolicyFactory: CancellationPolicyFactory

	constructor(restService: RestService) {
		this._restService = restService
		this._cancellationPolicyFactory = new CancellationPolicyFactory()
	}

	async create(learningProviderId: string, cancellationPolicy: CancellationPolicy): Promise<CancellationPolicy> {
		const data = await this._restService.post(
			`/learning-providers/${learningProviderId}/cancellation-policies`,
			cancellationPolicy
		)
		return this._cancellationPolicyFactory.create(data)
	}

	async get(learningProviderId: string, cancellationPolicyId: string): Promise<CancellationPolicy> {
		const data = this._restService.get(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`
		)

		return this._cancellationPolicyFactory.create(data)
	}

	async update(
		learningProviderId: string,
		cancellationPolicyId: string,
		cancellationPolicy: CancellationPolicy
	): Promise<CancellationPolicy> {
		const data = this._restService.put(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`,
			cancellationPolicy
		)

		return data
	}

	set cancellationPolicyFactory(value: CancellationPolicyFactory) {
		this._cancellationPolicyFactory = value
	}
}
