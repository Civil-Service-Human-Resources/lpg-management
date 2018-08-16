import {CancellationPolicy} from '../cancellationPolicy'

export class CancellationPolicyFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	create(data: any) {
		const cancellationPolicy: CancellationPolicy = new CancellationPolicy()

		cancellationPolicy.id = data.id
		cancellationPolicy.name = data.name
		cancellationPolicy.shortVersion = data.shortVersion
		cancellationPolicy.fullVersion = data.fullVersion

		return cancellationPolicy
	}
}
