const numberToMonthName = require('number-to-date-month-name')

const convert = require('convert-seconds')

const isoRegex = new RegExp(
	'^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?' + '(T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$'
)

export function parseDuration(isoDuration: string): number | undefined {
	const parts = isoDuration.match(isoRegex)
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


export function convertDate(date: string): string {
	let formattedDate: string = date.substr(date.length - 2, 2)

	if (formattedDate.charAt(0) == '0') {
		formattedDate = formattedDate.substr(1)
	}

	formattedDate += ' ' + numberToMonthName.toMonth(date.substr(5, 2))
	formattedDate += ' ' + date.substr(0, 4)

	return formattedDate
}

export function formatDuration(seconds: number): string {
	if (seconds) {
		const duration = convert(seconds)
		return duration.hours + 'h ' + duration.minutes + 'm'
	} else {
		return '0m'
	}
}
