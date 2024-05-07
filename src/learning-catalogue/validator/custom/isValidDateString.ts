import {registerDecorator, ValidationArguments, ValidationOptions} from 'class-validator'
import moment = require('moment')

export function IsValidDateString(validationOptions?: ValidationOptions) {
	return function(object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(value: any, args: ValidationArguments) {
					console.log(value)
					return moment(value, 'YYYY-MM-DD', true).isValid()
				},
			},
		})
	}
}
