import {IsValidDateString} from '../validator/custom/isValidDateString'
import {registerDecorator, ValidationArguments, ValidationOptions} from 'class-validator'
import moment = require('moment')

export class DateStartEnd {

	constructor(startDate: string, endDate: string) {
		this.startDate = startDate
		this.endDate = endDate
	}

	@IsValidDateString({
		message: 'validation_report_start_invalid',
	})
	@isStartDateBeforeEndDate({
		message: 'validation_report_start_after_end'
	})
	startDate: string

	@IsValidDateString({
		message: 'validation_report_end_invalid',
	})
	endDate: string
}

function isStartDateBeforeEndDate(validationOptions?: ValidationOptions) {
	return function(object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(startDate: any, args: ValidationArguments) {
					return moment(startDate, 'YYYY-MM-DD', true) < moment((args.object as any)['endDate'], 'YYYY-MM-DD', true)
				},
			},
		})
	}
}
