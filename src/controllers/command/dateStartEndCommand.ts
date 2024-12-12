import {IsNotEmpty, registerDecorator, ValidateIf, ValidationArguments, ValidationOptions} from 'class-validator'
import {Expose, Transform} from 'class-transformer'
import {IsValidDateString} from '../../learning-catalogue/validator/custom/isValidDateString'
import moment = require('moment')
import {SubmittableForm} from '../models/submittableForm'

export const padFn = (value?: string) => {
	if (value && value.length === 1) {
		value = `0${value}`
	}
	return value
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

export interface DateStartEnd {
	startDate: string
	endDate: string
}

export class DateStartEndCommand extends SubmittableForm {

	constructor(startDay?: string, startMonth?: string, startYear?: string,
				endDay?: string, endMonth?: string, endYear?: string,
				public errors?: {fields: any, size: any}) {
		super(errors)
		this.startDay = startDay
		this.startMonth = startMonth
		this.startYear = startYear
		this.endDay = endDay
		this.endMonth = endMonth
		this.endYear = endYear
	}

	public getErrorFields() {
		const errors = this.errors
		if (errors) {
			const errorFieldKeys = Object.keys(errors.fields)
			if (errorFieldKeys.length > 0) {
				return {[errorFieldKeys[0]]: errors.fields[errorFieldKeys[0]]}
			}
		}
		return undefined
	}

	public getErrorMsg(startEnd: 'start' | 'end'): string | undefined {
		const errors = this.errors
		if (errors) {
			for (const error of Object.keys(errors.fields)) {
				if (error.includes(startEnd)) {
					return errors.fields[error][0]
				}
			}
		}
	}

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation.date_range.valid_date',
	})
	public startDay?: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation.date_range.valid_date',
	})
	public startMonth?: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation.date_range.valid_date',
	})
	public startYear?: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation.date_range.valid_date',
	})
	public endDay?: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation.date_range.valid_date',
	})
	public endMonth?: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation.date_range.valid_date',
	})
	public endYear?: string

	@Expose()
	@Transform(({obj}) => {
		return `${obj.startYear}-${padFn(obj.startMonth)}-${padFn(obj.startDay)}`
	})
	@ValidateIf((object) => {
		console.log(object)
		return object.endDay && object.endMonth && object.endYear
	})
	@IsValidDateString({
		message: 'validation.date_range.valid_date',
	})
	@isStartDateBeforeEndDate({
		message: 'validation.date_range.validation_report_start_after_end'
	})
	public startDate?: string

	@Expose()
	@Transform(({obj}) => {
		return `${obj.endYear}-${padFn(obj.endMonth)}-${padFn(obj.endDay)}`
	})
	@IsValidDateString({
		message: 'validation.date_range.valid_date',
	})
	public endDate?: string

}
