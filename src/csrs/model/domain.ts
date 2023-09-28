import {IsValidDomain} from '../../models/validators/isValidDomain'

export class Domain {
	id: number
	@IsValidDomain({
		message: 'domain.validation.domain.invalid'
	})
	domain: string
}
