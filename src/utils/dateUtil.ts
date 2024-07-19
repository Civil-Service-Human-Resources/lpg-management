var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

export const defaultFeTimezone = 'Europe/London'

export function getServerDayJs(obj?: any) {
	return getTzDayJs('UTC', obj)
}

export function getFrontendDayJs(obj?: any) {
	return getTzDayJs(defaultFeTimezone, obj)
}

export function getTzDayJs(tz: string, obj?: any) {
	let dayObject
	if (obj) {
		dayObject = dayjs.tz(obj, tz)
	} else {
		dayObject = dayjs().tz(tz)
	}
	return dayjs(dayObject).utcOffset(dayObject.utcOffset())
}
