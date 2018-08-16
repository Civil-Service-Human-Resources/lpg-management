import {IsNotEmpty} from 'class-validator'

export class TermsAndConditions {
	public id: string

	@IsNotEmpty({
		groups: ['all', 'title'],
		message: 'validation.termsAndConditions.name.empty',
	})
	public name: string

	@IsNotEmpty({
		groups: ['all', 'termsAndConditions'],
		message: 'validation.termsAndConditions.content.empty',
	})
	public content: string
}
