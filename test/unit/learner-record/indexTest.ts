import {LearnerRecord} from '../../../src/learner-record'
import {beforeEach} from 'mocha'
import {Auth} from '../../../src/identity/auth'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {BookingFactory} from '../../../src/learner-record/model/factory/bookingFactory'
import {Booking} from '../../../src/learner-record/model/booking'
import {InviteFactory} from '../../../src/learner-record/model/factory/inviteFactory'
import {RestServiceConfig} from 'lib/http/restServiceConfig'
import {OauthRestService} from '../../../src/lib/http/oauthRestService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Leaner Record Tests', () => {
	let learnerRecord: LearnerRecord
	let inviteFactory: InviteFactory
	let bookingFactory: BookingFactory
	let restService: OauthRestService

	const config = new RestServiceConfig('http://example.org', 60000)
	const oauthRestService = new OauthRestService(config, {} as Auth)

	beforeEach(() => {
		inviteFactory = <InviteFactory>{}
		bookingFactory = <BookingFactory>{}
		restService = <OauthRestService>{}

		learnerRecord = new LearnerRecord(oauthRestService, bookingFactory, inviteFactory)
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

	it('should post new event to learner record', async () => {
		const eventId = 'eventId'
		const event = {
			uid: eventId,
			status: 'Active',
		}

		restService.post = sinon.stub().returns(event)

		const response = await learnerRecord.createEvent(eventId)

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
