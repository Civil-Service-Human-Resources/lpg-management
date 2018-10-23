import {registerDecorator, ValidationArguments, ValidationOptions} from 'class-validator'
import moment = require('moment')

export function IsAfterTimeString(property: string, validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "isAfterTimeString",
			target: object.constructor,
			propertyName: propertyName,
			constraints: [property],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					const [relatedPropertyName] = args.constraints;
					const relatedValue = (args.object as any)[relatedPropertyName];

					return (value && relatedValue) ? moment(value, 'HH:mm').isAfter(moment(relatedValue, 'HH:mm'))
						: true
				}
			}
		});
	};
}