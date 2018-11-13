import {registerDecorator, ValidationArguments, ValidationOptions} from 'class-validator'
import moment = require('moment')

export function IsFutureDateString(validationOptions?: ValidationOptions) {
	return function(object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(value: any, args: ValidationArguments) {
					return moment(value, 'YYYY-MM-DD').isAfter(Date.now())
				},
			},
		})
	}
}
