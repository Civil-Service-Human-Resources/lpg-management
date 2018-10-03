import {describe, it} from 'mocha'
import {expect} from 'chai'
import {EventFactory} from '../../../../../src/learning-catalogue/model/factory/eventFactory'
import {Event} from '../../../../../src/learning-catalogue/model/event'
import {VenueFactory} from '../../../../../src/learning-catalogue/model/factory/venueFactory'
import {DateRangeFactory} from '../../../../../src/learning-catalogue/model/factory/dateRangeFactory'
import {Venue} from '../../../../../src/learning-catalogue/model/venue'
import * as sinon from 'sinon'

describe('EventFactory tests', () => {
	let eventFactory: EventFactory
	let venueFactory: VenueFactory
	let dateRangeFactory: DateRangeFactory


	before(() => {
		venueFactory = <VenueFactory>{}
		dateRangeFactory = <DateRangeFactory>{}

		eventFactory = new EventFactory(venueFactory, dateRangeFactory)
	})

	it('should create Event from data', () => {
		const id: string = 'LmYAPQseRqm7dk1Q2WjA2w'
		const dateRanges = [{date: '2018-01-01', startTime: '6:00:00', endTime: '9:00:00'}]
		const location: string = 'London'
		const address: string = 'SE1'
		const capacity: number = 100
		const minCapacity: number = 10

		const data: object = {
			id: id,
			dateRanges: dateRanges,
			venue: {
				location: location,
				address: address,
				capacity: capacity,
				minCapacity: minCapacity,
			},
		}

		const venue = new Venue()
		venueFactory.create = sinon.stub().returns(venue)
		dateRangeFactory.create = sinon.stub().returns(dateRanges[0])

		const result: Event = eventFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.dateRanges).to.eql(dateRanges)
		expect(result.venue).to.equal(venue)
	})

	it('should ignore missing date', () => {
		const id: string = 'LmYAPQseRqm7dk1Q2WjA2w'
		const location: string = 'London'
		const address: string = 'SE1'
		const capacity: number = 100
		const minCapacity: number = 10

		const data: object = {
			id: id,
			date: null,
			venue: {
				location: location,
				address: address,
				capacity: capacity,
				minCapacity: minCapacity,
			},
		}


		const venue = new Venue()
		venueFactory.create = sinon.stub().returns(venue)
		dateRangeFactory.create = sinon.stub().returns([])

		const result: Event = eventFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.dateRanges).to.be.eql([])
		expect(result.venue).to.equal(venue)
	})
})
