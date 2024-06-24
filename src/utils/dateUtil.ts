var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

export function getFrontendDayJs(obj?: any) {
	if (obj) {
		return dayjs.tz(obj, 'Europe/London')
	} else {
		return dayjs().tz('Europe/London')
	}
}
