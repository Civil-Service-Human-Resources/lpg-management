import moment = require('moment')
import {DateRange} from '../learning-catalogue/model/dateRange'

export class DateTime {
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

	static formatDuration(seconds: number): string {
		if (seconds) {
			const duration = this.convert(seconds)
			return duration.hours + 'h' + duration.minutes + 'm'
		} else {
			return '0m'
		}
	}

	static yearMonthDayToDate(year: string, month: string, day: string) {
		return moment(`${year.padStart(4, '0')}${month.padStart(2, '0')}${day.padStart(2, '0')}`).toDate()
	}

	static yearMonthDayHourMinuteToDate(year: string, month: string, day: string, hour: string, minute: string) {
		return moment(
			`${year.padStart(4, '0')}${month.padStart(2, '0')}${day.padStart(2, '0')}T${hour.padStart(
				2,
				'0'
			)}${minute.padStart(2, '0')}`
		).toDate()
	}

	static compareDateRangesByStartDateTime(dateRange1: DateRange, dateRange2: DateRange) {
		return !dateRange1
			? 1
			: !dateRange2
				? -1
				: dateRange1.startDateTime > dateRange2.startDateTime
					? 1
					: dateRange1.startDateTime < dateRange2.startDateTime
						? -1
						: 0
	}

	static formatTimeAccordingToGdsStandard(dateTime: Date): string {
		const localMomentDateTime = moment(dateTime).local()

		return localMomentDateTime.minute() == 0
			? localMomentDateTime.hour() == 0
				? 'midnight'
				: localMomentDateTime.hour() == 12
					? 'midday'
					: localMomentDateTime.format('ha')
			: localMomentDateTime.format('h:mma')
	}
}
