import {IsNotEmpty} from 'class-validator'

export class OrganisationalUnitPageModel {

	@IsNotEmpty({
		message: 'organisations.validation.name.empty',
	})
	name: string

	@IsNotEmpty({
		message: 'organisations.validation.code.empty',
	})
	code: string

	abbreviation?: string

	/**
	 * The resource UID of the parent organisation.
	 */
	parentId?: number | null
}
