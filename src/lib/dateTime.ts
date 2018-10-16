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

	static sort(dateRange1: DateRange, dateRange2: DateRange) {
		const date1: string = dateRange1.date
		const date2: string = dateRange2.date

		const year1 = date1.substr(0, 4)
		const year2 = date2.substr(0, 4)

		if (year1 > year2) {
			return 1
		} else if (year1 < year2) {
			return -1
		} else {
			const month1 = date1.substr(5, 2)
			const month2 = date2.substr(5, 2)

			if (month1 > month2) {
				return 1
			} else if (month1 < month2) {
				return -1
			} else {
				const day1 = date1.substr(date1.length - 2, 2)
				const day2 = date2.substr(date2.length - 2, 2)

				if (day1 > day2) {
					return 1
				} else {
					return -1
				}
			}
		}
	}
}
