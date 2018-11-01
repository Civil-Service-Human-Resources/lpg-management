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
			startDateTime: moment()
				.add(1, 'day')
				.hour(9)
				.minute(30)
				.toDate(),
			endDateTime: moment()
				.add(1, 'day')
				.hour(17)
				.minute(30)
				.toDate(),
		}

		const result = await validator.check(data, ['event.dateRanges'])

		return expect(result.size).to.be.equal(0)
	})

	it('should fail validation if date is in the past', async () => {
		const data: any = {
			startDateTime: moment()
				.subtract(1, 'day')
				.hour(9)
				.minute(30)
				.toDate(),
			endDateTime: moment()
				.subtract(1, 'day')
				.hour(17)
				.minute(30)
				.toDate(),
		}

		const result = await validator.check(data, ['event.dateRanges'])

		expect(result.size).to.be.equal(1)
		expect(result.fields).to.be.eql({
			startDateTime: ['module.validation.event.startDateTime.dateIsNotInFuture'],
		})
	})

	it('should fail validation if startDateTime is missing', async () => {
		const data: any = {
			endDateTime: new Date(),
		}

		const result = await validator.check(data, ['event.dateRanges'])

		expect(result.size).to.be.greaterThan(0)
		expect(result.fields).to.deep.include({
			startDateTime: [
				'module.validation.event.startDateTime.invalidDate',
				'module.validation.event.startDateTime.dateIsNotInFuture',
			],
		})
	})

	it('should fail validation if endDateTime is missing', async () => {
		const data: any = {
			startDateTime: moment()
				.add(1, 'day')
				.toDate(),
		}

		const result = await validator.check(data, ['event.dateRanges'])

		expect(result.size).to.be.equal(1)
		expect(result.fields).to.be.eql({
			endDateTime: ['module.validation.event.endDateTime.endTimeNotAfterStart'],
		})
	})

	it('should fail validation if endDateTime is before startDateTime', async () => {
		const data: any = {
			startDateTime: moment()
				.add(1, 'day')
				.hour(17)
				.minute(30)
				.toDate(),
			endDateTime: moment()
				.add(1, 'day')
				.hour(9)
				.minute(30)
				.toDate(),
		}

		const result = await validator.check(data, ['event.dateRanges'])

		expect(result.size).to.be.equal(1)
		expect(result.fields).to.be.eql({
			endDateTime: ['module.validation.event.endDateTime.endTimeNotAfterStart'],
		})
	})
})
