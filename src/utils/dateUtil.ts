import {Dayjs} from 'dayjs'

var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
var advancedFormat = require("dayjs/plugin/advancedFormat");

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

dayjs.tz.setDefault("UTC")

export function getFrontendDayJs(obj?: any): Dayjs {
	if (obj) {
		return dayjs(obj)
	}
	return dayjs()
}
