import {IsValidDomain} from '../../../validators/isValidDomain'
import {IsNotEmpty, registerDecorator, ValidateIf, ValidationArguments, ValidationOptions} from 'class-validator'
import {Transform} from 'class-transformer'
import {SubmittableForm} from '../../models/submittableForm'

function validateDomainDoesNotExist(validationOptions?: ValidationOptions) {
	return function(object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(domain: string, args: ValidationArguments) {
					return ! (args.object as AddDomain).domain.includes(domain)
				},
			},
		})
	}
}

export class AddDomain extends SubmittableForm {

	@Transform(({value}) => {
		if (typeof value === "string") {
			return [value]
		} else {
			return [...value]
		}
	})
	public domain: string[] = []

	@ValidateIf(o => o.domainToAdd !== undefined)
	@IsValidDomain({
		message: 'domains.validation.domains.invalidFormat'
	})
	@IsNotEmpty({
		message: 'domains.validation.domains.empty',
	})
	@Transform(({value}) => { return value.toLowerCase() })
	@validateDomainDoesNotExist({
		message: 'domains.validation.domains.alreadyExists',
	})
	public domainToAdd?: string

}
