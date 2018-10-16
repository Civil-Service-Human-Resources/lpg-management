import moment = require('moment')
import {DateRange} from '../learning-catalogue/model/dateRange'

export class DateTime {
	private static readonly numberToMonthName = require('number-to-date-month-name')
	private static readonly convert = require('convert-seconds')
	private static readonly isoRegex = new RegExp(
		'^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?' + '(T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$'
	)

	static parseDuration(isoDuration: string): number | undefined {
		const parts = isoDuration.match(this.isoRegex)
		if (!parts) {
			return
		}
		// Abort if the duration specifies either year or month components.
		if (parts[2] || parts[3]) {
			return
		}
		let duration = 0
		duration += parseFloat(parts[8]) || 0
		duration += (parseInt(parts[7], 10) || 0) * 60
		duration += (parseInt(parts[6], 10) || 0) * 3600
		duration += (parseInt(parts[4], 10) || 0) * 86400
		// Accept the leading minus sign for now, but might want to abort in future.
		if (parts[1]) {
			return -duration
		}
		return duration
	}

	static convertDate(date: string): string {
		let formattedDate: string = date.substr(date.length - 2, 2)

		if (formattedDate.charAt(0) == '0') {
			formattedDate = formattedDate.substr(1)
		}

		formattedDate += ' ' + this.numberToMonthName.toMonth(date.substr(5, 2))
		formattedDate += ' ' + date.substr(0, 4)

		return formattedDate
	}

	static formatDuration(seconds: number): string {
		if (seconds) {
			const duration = this.convert(seconds)
			return duration.hours + 'h' + duration.minutes + 'm'
		} else {
			return '0m'
		}
	}

	static yearMonthDayToDate(year: string, month: string, day: string) {
		return moment(`${year.padStart(4, '0')}${month.padStart(2, '0')}${day.padStart(2, '0')}`)
	}

	static sortDateRanges(dateRange1: DateRange, dateRange2: DateRange) {
		if (dateRange1.date > dateRange2.date) {
			return 1
		} else {
			return -1
		}
	}
}
