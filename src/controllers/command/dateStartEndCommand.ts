import {IsNotEmpty} from 'class-validator'
import moment = require('moment')
import {DateStartEnd} from '../../learning-catalogue/model/dateStartEnd'

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

	asDateRange() {
		const dateRange = new DateStartEnd()
		dateRange.startDate = moment([this.startYear, +this.startMonth - 1, this.startDay]).format('YYYY-MM-DD')
		dateRange.endDate = moment([this.endYear, +this.endMonth - 1, this.endDay]).format('YYYY-MM-DD')

		return dateRange
	}

	getStartDate(): string {
		return moment([this.startYear, +this.startMonth - 1, this.startDay]).format('YYYY-MM-DD')
	}

	getEndDate(): string {
		return moment([this.endYear, +this.endMonth - 1, this.endDay]).format('YYYY-MM-DD')
	}
}
