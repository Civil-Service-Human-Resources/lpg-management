import {registerDecorator, ValidationArguments, ValidationOptions} from 'class-validator'
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
				validate(value: any, args: ValidationArguments) {
					const [relatedPropertyName] = args.constraints;
					const relatedValue = (args.object as any)[relatedPropertyName];
					return typeof value === 'string' && typeof relatedValue === 'string' && isValidDomain(value)
				},
			},
		});
	};
}
