import {beforeEach, describe, it} from 'mocha'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {DateTime} from '../../../src/lib/dateTime'
import {expect} from 'chai'
import {DateRange} from '../../../src/learning-catalogue/model/dateRange'
import moment = require('moment')

chai.use(sinonChai)

describe('Tests for dateTime', () => {
	describe('#compareDateRangesByStartDateTime', () => {
		let dateRange1: DateRange
		let dateRange2: DateRange

		beforeEach(() => {
			dateRange1 = new DateRange()
			dateRange2 = new DateRange()
		})

		it('should return 1 if first dateRange is undefined', () => {
			const arrayToGetUndefinedValue: Array<DateRange> = []
			expect(DateTime.compareDateRangesByStartDateTime(arrayToGetUndefinedValue[0], dateRange2)).to.be.equal(1)
		})

		it('should return -1 if second dateRange is undefined', () => {
			const arrayToGetUndefinedValue: Array<DateRange> = []
			expect(DateTime.compareDateRangesByStartDateTime(dateRange1, arrayToGetUndefinedValue[0])).to.be.equal(-1)
		})

		it('should return -1 if both dateRange are defined and first start date time is before second start date time', () => {
			dateRange1.startDateTime = new Date(Date.UTC(1979, 1))
			dateRange2.startDateTime = new Date()
			expect(DateTime.compareDateRangesByStartDateTime(dateRange1, dateRange2)).to.be.equal(-1)
		})

		it('should return 0 if both dateRange are defined and first start date time is equal to second start date time', () => {
			dateRange1.startDateTime = new Date(Date.UTC(1979, 1))
			dateRange2.startDateTime = new Date(Date.UTC(1979, 1))
			expect(DateTime.compareDateRangesByStartDateTime(dateRange1, dateRange2)).to.be.equal(0)
		})

		it('should return 1 if both dateRange are defined and first start date time is after second start date time', () => {
			dateRange1.startDateTime = new Date()
			dateRange2.startDateTime = new Date(Date.UTC(1979, 1))
			expect(DateTime.compareDateRangesByStartDateTime(dateRange1, dateRange2)).to.be.equal(1)
		})
	})

	describe('#formatTimeAccordingToGdsStandard', () => {
		beforeEach(() => {
			moment.locale('en-GB')
		})

		it('should display time in "ha" format if minutes are zero', () => {
			let date: Date = new Date(Date.UTC(2018, 10, 1, 9))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('9am')

			date = new Date(Date.UTC(2018, 10, 1, 10))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('10am')

			date = new Date(Date.UTC(2018, 10, 1, 13))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('1pm')

			date = new Date(Date.UTC(2018, 10, 1, 22))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('10pm')
		})

		it('should display time in "h:mma" format if minutes are not zero', () => {
			let date: Date = new Date(Date.UTC(2018, 10, 1, 9, 30))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('9:30am')

			date = new Date(Date.UTC(2018, 10, 1, 10, 30))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('10:30am')

			date = new Date(Date.UTC(2018, 10, 1, 13, 30))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('1:30pm')

			date = new Date(Date.UTC(2018, 10, 1, 22, 30))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('10:30pm')
		})

		it('should display midnight for 12am and midday for 12pm', () => {
			let date: Date = new Date(Date.UTC(2018, 10, 1, 0, 0))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('midnight')

			date = new Date(Date.UTC(2018, 10, 1, 12, 0))
			expect(DateTime.formatTimeAccordingToGdsStandard(date)).to.be.equal('midday')
		})
	})
})
