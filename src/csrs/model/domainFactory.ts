import {Domain} from './domain'

export class DomainFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	public create(data: any): any {
		const domain: Domain = new Domain()

		domain.domain = data

		return domain
	}
}
