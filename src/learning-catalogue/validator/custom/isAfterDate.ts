import {registerDecorator, ValidationArguments, ValidationOptions} from 'class-validator'

export function IsAfterDate(datePropertyName: string, validationOptions?: ValidationOptions) {
	return function(object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [datePropertyName],
			validator: {
				validate(value: any, args: ValidationArguments) {
					const [beforeDatePropertyName] = args.constraints
					const beforeDatePropertyValue = (args.object as any)[beforeDatePropertyName]
					return (
						value instanceof Date &&
						beforeDatePropertyValue instanceof Date &&
						value > beforeDatePropertyValue
					)
				},
			},
		})
	}
}
