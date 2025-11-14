import {IsNotEmpty, MaxLength} from 'class-validator'
import {Transform} from 'class-transformer'
import {SubmittableForm} from '../../controllers/models/submittableForm'

export class OrganisationalUnitPageModel extends SubmittableForm {

	@IsNotEmpty({
		message: 'organisations.validation.name.empty',
	})
	@Transform(({value}) => {
		return value.replaceAll("&amp;", "&").trim()
	})
	name: string

	@IsNotEmpty({
		message: 'organisations.validation.code.empty',
	})
	@MaxLength(10, {
		message: 'organisations.validation.code.length',
	})
	code: string

	abbreviation?: string

	/**
	 * Undefined if no parent set. null if unlinking current parent
	 */
	parentId?: number | null


	constructor(name: string, code: string, abbreviation: string, parentId: number | null) {
		super()
		this.name = name
		this.code = code
		this.abbreviation = abbreviation
		this.parentId = parentId
	}
}
