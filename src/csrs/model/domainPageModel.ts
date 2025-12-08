import {IsValidDomain} from '../../validators/isValidDomain'
import {IsNotEmpty} from 'class-validator'
import {Transform} from 'class-transformer'
import {SubmittableForm} from '../../controllers/models/submittableForm'

export class DomainPageModel extends SubmittableForm {
	@IsValidDomain({
		message: 'domains.validation.domains.invalidFormat'
	})
	@IsNotEmpty({
		message: 'domains.validation.domains.empty',
	})
	@Transform(({value}) => { return value.toLowerCase() })
	domainToAdd: string
}

export class DeleteDomainPageModel extends SubmittableForm {
	removeFromSubOrgs: boolean = false
}
