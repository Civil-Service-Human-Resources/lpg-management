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
import {InviteFactory} from '../../../src/learner-record/model/factory/inviteFactory'
import {Invite} from '../../../src/learner-record/model/invite'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Leaner Record Tests', () => {
	let learnerRecord: LearnerRecord
	let inviteFactory: InviteFactory
	let bookingFactory: BookingFactory
	let restService: OauthRestService

	const config = new LearnerRecordConfig('http://example.org', 60000)

	beforeEach(() => {
		inviteFactory = <InviteFactory>{}
		bookingFactory = <BookingFactory>{}
		restService = <OauthRestService>{}

		learnerRecord = new LearnerRecord(config, {} as Auth, bookingFactory, inviteFactory)
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

		expect(learnerRecord.getEventBookings(eventId)).to.be.rejectedWith(`An error occurred when trying to get event bookings: Error: An error occurred when GETTING`)
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
			cancellationReason: undefined,
		})
	})

	it('should throw error if error occurs with PATCH request', async () => {
		const eventId = 'eventId'
		const booking = new Booking()

		restService.patch = sinon.stub().throws(new Error(`An error occurred when PATCHING`))

		expect(learnerRecord.updateBooking(eventId, booking)).to.be.rejectedWith('An error occurred when trying to update booking: Error: An error occurred when PATCHING')
	})

	it('should call rest service when getting invitees', async () => {
		const eventId = 'eventId'
		restService.get = sinon.stub().returns([{learnerEmail: 'test1@test.com'}])
		inviteFactory.create = sinon.stub()

		await learnerRecord.getEventInvitees(eventId)

		expect(restService.get).to.have.been.calledOnceWith('/event/eventId/invitee')
		expect(inviteFactory.create).to.have.been.calledOnceWith({learnerEmail: 'test1@test.com'})
	})

	it('should throw error is getting invitee throws error', async () => {
		const eventId = 'eventId'

		restService.get = sinon.stub().throws(new Error('Test Error'))

		expect(learnerRecord.getEventInvitees(eventId)).to.be.rejectedWith(`An error occurred when trying to get event invitees: Error: Test Error`)
	})

	it('should call rest service when posting invitee', async () => {
		const eventId = 'eventId'
		const invite: Invite = new Invite()

		restService.post = sinon.stub()

		await learnerRecord.inviteLearner(eventId, invite)

		expect(restService.post).to.have.been.calledOnceWith('/event/eventId/invitee', invite)
	})

	it('should throw 409 error if learner already invited', async () => {
		const eventId = 'eventId'
		const invite: Invite = new Invite()

		restService.post = sinon.stub().throws(new Error('Learner has already been invite to course: 409'))

		expect(learnerRecord.inviteLearner(eventId, invite)).to.be.rejectedWith(`Learner has already been invite to course: 409`)
	})

	it('should throw 404 error if learner does not exist', async () => {
		const eventId = 'eventId'
		const invite: Invite = new Invite()

		restService.post = sinon.stub().throws(new Error('Email address not registered: 404'))

		expect(learnerRecord.inviteLearner(eventId, invite)).to.be.rejectedWith(`Email address not registered: 404`)
	})

	it('should post new event to learner record', async () => {
		const eventId = 'eventId'
		const uri = 'test/path/to/eventId'

		const event = {
			uid: eventId,
			uri: uri,
			status: 'Active',
		}

		restService.post = sinon.stub().returns(event)

		const response = await learnerRecord.createEvent(eventId, uri)

		expect(response).to.equal(event)
		expect(restService.post).to.have.been.calledOnceWith('/event', event)
	})

	it('should get cancellation reasons', async () => {
		const cancellationReasons = {
			UNAVAILABLE: 'event is unavailable',
		}

		restService.get = sinon.stub().returns(cancellationReasons)

		const response = await learnerRecord.getCancellationReasons()

		expect(response).to.equal(cancellationReasons)
		expect(restService.get).to.have.been.calledOnceWith(`/event/cancellationReasons`)
	})

	it('should get booking cancellationReasons', async () => {
		const cancellationReasons = {
			PAYMENT: 'booking has not been paid',
		}

		restService.get = sinon.stub().returns(cancellationReasons)

		const response = await learnerRecord.getBookingCancellationReasons()

		expect(response).to.equal(cancellationReasons)
		expect(restService.get).to.have.been.calledOnceWith(`/event/booking/cancellationReasons`)
	})
})
