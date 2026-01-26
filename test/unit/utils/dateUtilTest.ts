import {expect} from 'chai'

var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
var advancedFormat = require("dayjs/plugin/advancedFormat");

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
import {getStartOfJs} from '../../../src/utils/dateUtil'

describe('DateUtil tests', () => {
	describe('getStartOfJs tests', () => {
		it('Should return the dayjs with a timezone, when the startOf is a day', () => {
			const start = getStartOfJs(dayjs('2024-04-01').tz('Europe/London'), dayjs('2025-01-01').tz('Europe/London'))
			expect(start.utcOffset()).to.eql(60)
		})
		it('Should return the dayjs without a timezone, when the startOf is a month', () => {
			const start = getStartOfJs(dayjs('2024-12-01'), dayjs('2025-01-01'))
			expect(start.utcOffset()).to.eql(-0)
		})
	})
})