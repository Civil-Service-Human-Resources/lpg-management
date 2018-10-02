import {IsNotEmpty} from 'class-validator'
import moment = require('moment')
import {DateRange} from '../../learning-catalogue/model/dateRange'

export class DateRangeCommand {
	@IsNotEmpty({
		message: 'validation_daterange_day_empty'
	})
	day: string

	@IsNotEmpty({
		message: 'validation_daterange_month_empty'
	})
	month: string

	@IsNotEmpty({
		message: 'validation_daterange_year_empty'
	})
	year: string

	startTime: string[]
	endTime: string[]

	asDateRange() {
		const dateRange = new DateRange()
		dateRange.date = moment([this.year, +(this.month) - 1, this.day]).format('YYYY-MM-DD')
		dateRange.startTime = moment([this.startTime[0], this.startTime[1]], 'HH:mm').format('HH:mm')
		dateRange.endTime = moment([this.endTime[0], this.endTime[1]], 'HH:mm').format('HH:mm')

		return dateRange
	}
}