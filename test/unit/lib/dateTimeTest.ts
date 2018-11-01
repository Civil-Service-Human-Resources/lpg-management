import {beforeEach, describe, it} from 'mocha'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {DateTime} from '../../../src/lib/dateTime'
import {expect} from 'chai'
import {DateRange} from '../../../src/learning-catalogue/model/dateRange'

chai.use(sinonChai)

describe('Tests for dateTime', () => {
	it('should return date with month as text', () => {
		const date = '2020-02-01'

		const response = DateTime.convertDate(date)

		expect(response).to.equal('1 February 2020')
	})

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
})
