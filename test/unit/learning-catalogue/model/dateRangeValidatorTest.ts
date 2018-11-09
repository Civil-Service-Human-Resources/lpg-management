import {DateRange} from '../../../../src/learning-catalogue/model/dateRange'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {DateRangeFactory} from '../../../../src/learning-catalogue/model/factory/dateRangeFactory'
import {Factory} from '../../../../src/learning-catalogue/model/factory/factory'
import * as moment from 'moment'
import {expect} from 'chai'

describe('DateRange validation tests', () => {
	let dateRangeFactory: Factory<DateRange>
	let validator: Validator<DateRange>

	before(() => {
		dateRangeFactory = new DateRangeFactory()
		validator = new Validator<DateRange>(dateRangeFactory)
	})

	it('should pass validation if date is in the future and start time is after end time', async () => {
		const data: any = {
			date: moment()
				.add(1, 'day')
				.format('YYYY-MM-DD'),
			startTime: moment([9, 30], 'HH:mm').format('HH:mm'),
			endTime: moment([17, 30], 'HH:mm').format('HH:mm'),
		}

		const result = await validator.check(data, ['event.dateRanges.date'])

		return expect(result.size).to.be.equal(0)
	})

	it('should fail validation if date is in the past', async () => {
		const data: any = {
			date: moment()
				.subtract(1, 'day')
				.format('YYYY-MM-DD'),
			startTime: moment([9, 30], 'HH:mm').format('HH:mm'),
			endTime: moment([17, 30], 'HH:mm').format('HH:mm'),
		}

		const result = await validator.check(data, ['event.dateRanges.date'])

		expect(result.size).to.be.equal(1)
		expect(result.fields).to.be.eql({
			date: ['validation_module_event_dateRanges_past'],
		})
	})

	it('should fail validation if startTime is missing', async () => {
		const data: any = {
			date: moment()
				.subtract(1, 'day')
				.format('YYYY-MM-DD'),
			endTime: moment([17, 30], 'HH:mm').format('HH:mm'),
		}

		const result = await validator.check(data, ['event.dateRanges.startTime'])

		expect(result.size).to.be.equal(1)
		expect(result.fields).to.be.eql({
			startTime: ['validation_module_event_start_empty'],
		})
	})

	it('should fail validation if endTime is missing', async () => {
		const data: any = {
			date: moment()
				.subtract(1, 'day')
				.format('YYYY-MM-DD'),
			startTime: moment([9, 30], 'HH:mm').format('HH:mm'),
		}

		const result = await validator.check(data, ['event.dateRanges.endTime'])

		expect(result.size).to.be.equal(1)
		expect(result.fields).to.be.eql({
			endTime: ['validation_module_event_end_empty'],
		})
	})

	it('should fail validation if endTime is before startTime', async () => {
		const data: any = {
			date: moment()
				.subtract(1, 'day')
				.format('YYYY-MM-DD'),
			startTime: moment([17, 30], 'HH:mm').format('HH:mm'),
			endTime: moment([9, 30], 'HH:mm').format('HH:mm'),
		}

		const result = await validator.check(data, ['event.dateRanges.endTime'])

		expect(result.size).to.be.equal(1)
		expect(result.fields).to.be.eql({
			endTime: ['validation_module_event_dateRanges_endBeforeStart'],
		})
	})
})
