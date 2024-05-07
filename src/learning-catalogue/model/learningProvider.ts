import {IsNotEmpty} from 'class-validator'
import {CancellationPolicy} from './cancellationPolicy'
import {TermsAndConditions} from './termsAndConditions'
import {Type} from 'class-transformer'

export class LearningProvider {
	public id: string

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'validation_learningProvider_name_empty',
	})
	public name: string

	@Type(() => CancellationPolicy)
	cancellationPolicies: CancellationPolicy[]

	@Type(() => TermsAndConditions)
	termsAndConditions: TermsAndConditions[]
}
