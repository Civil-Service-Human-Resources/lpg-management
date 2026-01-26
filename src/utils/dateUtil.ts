import {Dayjs, OpUnitType} from 'dayjs'

var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
var advancedFormat = require("dayjs/plugin/advancedFormat");

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
const tz = "Europe/London"

export function getTimezoneString(): string {
	return `+${getFrontendDayJs().utcOffset() / 60}`
}

export function getStartOfJs(start: any, end: any) {
	let startOf: OpUnitType = end.diff(start, 'day') <= 31 ? 'day' : 'month'
	start = start.startOf(startOf)
	if (startOf === 'day') {
		start.tz(tz)
	}
	return start
}

export function getDayjs(obj?: any): Dayjs {
	if (obj) {
		return dayjs(obj)
	}
	return dayjs()
}

export function getFrontendDayJs(obj?: any): Dayjs {
	if (obj) {
		return dayjs(obj).tz(tz)
	}
	return dayjs().tz(tz)
}
