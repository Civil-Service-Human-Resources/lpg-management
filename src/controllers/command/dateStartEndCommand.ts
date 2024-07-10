import {IsNotEmpty} from 'class-validator'
import {Transform} from 'class-transformer'

const padFn = (data: {value: string}) => {
	let value = data['value']
	if (value.length === 1) {
		value = `0${value}`
	}
	return value
}

export class DateStartEndCommand {
	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_day_empty',
	})
	@Transform(padFn)
	startDay: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_month_empty',
	})
	@Transform(padFn)
	startMonth: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_year_empty',
	})
	startYear: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_day_empty',
	})
	@Transform(padFn)
	endDay: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_month_empty',
	})
	@Transform(padFn)
	endMonth: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_year_empty',
	})
	endYear: string

	getStartDate(): string {
		return `${this.startYear}-${this.startMonth}-${this.startDay}`
	}

	getEndDate(): string {
		return `${this.endYear}-${this.endMonth}-${this.endDay}`
	}
}
