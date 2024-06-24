var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

export function getFrontendDayJs(obj?: any) {
	const tz = 'Europe/London'
	if (obj) {
		return dayjs.tz(obj, tz)
	} else {
		return dayjs().tz(tz)
	}
}
