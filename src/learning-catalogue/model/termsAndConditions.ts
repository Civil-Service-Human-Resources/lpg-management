import {IsNotEmpty} from 'class-validator'

export class TermsAndConditions {
	public id: string

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'termsAndConditions.validation.name.empty',
	})
	public name: string

	@IsNotEmpty({
		groups: ['all', 'content'],
		message: 'termsAndConditions.validation.content.empty',
	})
	public content: string
}
