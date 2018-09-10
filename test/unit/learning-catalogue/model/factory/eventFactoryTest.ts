import {describe, it} from 'mocha'
import {expect} from 'chai'
import {EventFactory} from '../../../../../src/learning-catalogue/model/factory/eventFactory'
import {Event} from '../../../../../src/learning-catalogue/model/event'

describe('EventFactory tests', () => {
	const eventFactory: EventFactory = new EventFactory()

	it('should create Event from data', () => {
		const id: string = 'LmYAPQseRqm7dk1Q2WjA2w'
		const dateRanges = [{date: '2018-01-01', startTime: '6:00:00', endTime: '9:00:00'}]
		const location: string = 'London'
		const capacity: number = 100

		const data: object = {
			id: id,
			dateRanges: dateRanges,
			location: location,
			capacity: capacity,
		}
		const result: Event = eventFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.dateRanges).to.equal(dateRanges)
		expect(result.location).to.equal(location)
		expect(result.capacity).to.equal(capacity)
	})

	it('should ignore missing date', () => {
		const id: string = 'LmYAPQseRqm7dk1Q2WjA2w'
		const location: string = 'London'
		const capacity: number = 100

		const data: object = {
			id: id,
			date: null,
			location: location,
			capacity: capacity,
		}

		const result: Event = eventFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.dateRanges).to.be.undefined
		expect(result.location).to.equal(location)
		expect(result.capacity).to.equal(capacity)
	})
})
