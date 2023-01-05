import {IsNotEmpty} from 'class-validator'

export class OrganisationalUnitPageModel {

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'organisations.validation.name.empty',
	})
	name: string

	@IsNotEmpty({
		groups: ['all', 'code'],
		message: 'organisations.validation.code.empty',
	})
	code: string

	abbreviation?: string

	/**
	 * The resource UID of the parent organisation.
	 */
	parentId?: number | null
}
