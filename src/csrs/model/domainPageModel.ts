import {IsValidDomain} from '../../validators/isValidDomain'
import {IsNotEmpty} from 'class-validator'
import {Transform} from 'class-transformer'

export class DomainPageModel {
	@IsValidDomain({
		message: 'domains.validation.domains.invalidFormat'
	})
	@IsNotEmpty({
		message: 'domains.validation.domains.empty',
	})
	@Transform(({value}) => { return value.toLowerCase() })
	domainToAdd: string
}
