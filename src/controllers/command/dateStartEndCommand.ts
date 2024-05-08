import {IsNotEmpty} from 'class-validator'

export class DateStartEndCommand {
	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_day_empty',
	})
	startDay: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_month_empty',
	})
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
	endDay: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_month_empty',
	})
	endMonth: string

	@IsNotEmpty({
		groups: ['all'],
		message: 'validation_daterange_year_empty',
	})
	endYear: string

	getStartDate(): string {
		return `${this.startYear}-${+this.startMonth-1}-${this.startDay}`
	}

	getEndDate(): string {
		return `${this.endYear}-${+this.endMonth-1}-${this.endDay}`
	}
}
