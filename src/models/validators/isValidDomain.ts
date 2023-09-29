import {registerDecorator, ValidationOptions} from 'class-validator'
const isValidDomain = require('is-valid-domain')

export function IsValidDomain(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isValidDomain',
			target: object.constructor,
			propertyName: propertyName,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: any) {
					return typeof value === 'string' && isValidDomain(value)
				},
			},
		});
	};
}
