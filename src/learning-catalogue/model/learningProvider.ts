import {IsNotEmpty} from 'class-validator'
import {CancellationPolicy} from './cancellationPolicy'
import {TermsAndConditions} from './termsAndConditions'

export class LearningProvider {
	public id: string

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'validation_learningProvider_name_empty',
	})
	public name: string

	cancellationPolicies: CancellationPolicy[]

	termsAndConditions: TermsAndConditions[]
}
