import {Dayjs} from 'dayjs'

var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
var advancedFormat = require("dayjs/plugin/advancedFormat");

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

export const defaultFeTimezone = 'Europe/London'
const offset = dayjs().tz(defaultFeTimezone).utcOffset()

export function getFrontendDayJs(obj?: any): Dayjs {
	if (obj) {
		return dayjs(obj).utcOffset(offset)
	}
	return dayjs().utcOffset(offset)
}

export function getDayJsRawValue(obj: any) {
	return getFrontendDayJs(obj).valueOf()
}
