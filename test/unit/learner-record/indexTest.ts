import {LearnerRecord} from '../../../src/learner-record'
import {LearnerRecordConfig} from '../../../src/learner-record/learnerRecordConfig'
import {beforeEach} from 'mocha'
import {Auth} from '../../../src/identity/auth'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {OauthRestService} from 'lib/http/oauthRestService'
import {BookingFactory} from '../../../src/learner-record/model/factory/bookingFactory'
import {Booking} from '../../../src/learner-record/model/booking'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Leaner Record Tests', () => {
	let learnerRecord: LearnerRecord
	let bookingFactory: BookingFactory
	let restService: OauthRestService

	const config = new LearnerRecordConfig('http://example.org')

	beforeEach(() => {
		bookingFactory = <BookingFactory>{}
		restService = <OauthRestService>{}

		learnerRecord = new LearnerRecord(config, {} as Auth, bookingFactory)
		learnerRecord.restService = restService
	})

	it('should get event bookings', async () => {
		const eventId = 'test-event-id'
		const data = [new Booking(), new Booking()]

		restService.get = sinon.stub().returns(data)
		bookingFactory.create = sinon.stub().returns(data)

		await learnerRecord.getEventBookings(eventId)

		expect(restService.get).to.have.been.calledOnceWith(`/event/test-event-id/booking`)
		expect(bookingFactory.create).to.have.been.calledTwice
	})

	it('should throw error if error occurs in GET request', async () => {
		const eventId = 'test-event-id'

		restService.get = sinon.stub().throws(new Error(`An error occurred when GETTING`))

		expect(learnerRecord.getEventBookings(eventId)).to.be.rejectedWith(`An error occurred when trying to get event bookings: An error occurred when GETTING`)
	})

	it('should update booking', async () => {
		const eventId = 'test-event-id'
		const booking: Booking = new Booking()
		booking.id = 99
		booking.status = Booking.Status.REQUESTED

		restService.patch = sinon.stub()
		await learnerRecord.updateBooking(eventId, booking)

		expect(restService.patch).to.have.been.calledOnceWith('/event/test-event-id/booking/99', {
			status: booking.status,
		})
	})

	it('should throw error if error occurs with PATCH request', async () => {
		const eventId = 'eventId'
		const booking = new Booking()

		restService.patch = sinon.stub().throws(new Error(`An error occurred when PATCHING`))

		expect(learnerRecord.updateBooking(eventId, booking)).to.be.rejectedWith('An error occurred when trying to update booking: An error occurred when PATCHING')
	})
})
