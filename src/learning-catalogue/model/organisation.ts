import {IsNotEmpty} from 'class-validator'

export class Organisation {
	public id: string

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'validation_organisation_name_empty',
	})
	public name: string
	public code: string
	public abbreviation: string
}
