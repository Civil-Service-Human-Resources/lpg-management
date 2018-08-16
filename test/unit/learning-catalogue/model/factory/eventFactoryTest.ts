import {describe, it} from 'mocha'
import {expect} from 'chai'
import {EventFactory} from '../../../../../src/learning-catalogue/model/factory/eventFactory'
import {Event} from '../../../../../src/learning-catalogue/model/event'

describe('EventFactory tests', () => {
	const eventFactory: EventFactory = new EventFactory()

	it('should create Event from data', () => {
		const id: string = 'LmYAPQseRqm7dk1Q2WjA2w'
		const date: string = '2018-03-27T00:00:00'
		const location: string = 'London'
		const capacity: number = 100

		const data: object = {
			id: id,
			date: date,
			location: location,
			capacity: capacity,
		}
		const result: Event = eventFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.date.toISOString().substr(0, 19)).to.equal(date)
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
		expect(result.date).to.be.undefined
		expect(result.location).to.equal(location)
		expect(result.capacity).to.equal(capacity)
	})
})
