import {TermsAndConditions} from '../termsAndConditions'
import {Factory} from './factory'

export class TermsAndConditionsFactory implements Factory<TermsAndConditions> {
	create(data: any) {
		const termsAndConditions: TermsAndConditions = new TermsAndConditions()

		termsAndConditions.id = data.id
		termsAndConditions.name = data.name
		termsAndConditions.content = data.content

		return termsAndConditions
	}
}
