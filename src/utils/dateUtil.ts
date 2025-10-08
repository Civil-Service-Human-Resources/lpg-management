import {Dayjs} from 'dayjs'

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

export function getFrontendDayJs(obj?: any): Dayjs {
	if (obj) {
		return dayjs(obj).tz(tz)
	}
	return dayjs().tz(tz)
}
