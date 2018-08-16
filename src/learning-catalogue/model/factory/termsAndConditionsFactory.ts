import {TermsAndConditions} from '../termsAndConditions'

export class TermsAndConditionsFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	create(data: any) {
		const termsAndConditions: TermsAndConditions = new TermsAndConditions()

		termsAndConditions.id = data.id
		termsAndConditions.name = data.name
		termsAndConditions.content = data.content

		return termsAndConditions
	}
}
