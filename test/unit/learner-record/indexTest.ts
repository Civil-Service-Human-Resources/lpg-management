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
	let bookingFactory: BookingFactory
	let inviteFactory: InviteFactory
	let restService: OauthRestService

	const config = new LearnerRecordConfig('http://example.org')

	beforeEach(() => {
		bookingFactory = <BookingFactory>{}
		inviteFactory = <InviteFactory>{}
		restService = <OauthRestService>{}

		learnerRecord = new LearnerRecord(config, {} as Auth, inviteFactory)
		learnerRecord.restService = restService
	})

	it('should get event bookings', async () => {
		const eventId = 'test-event-id'
		const data = [new Booking(), new Booking()]

		restService.get = sinon.stub().returns(data)
		bookingFactory.create = sinon.stub()

		await learnerRecord.getEventBookings(eventId)

		expect(restService.get).to.have.been.calledOnceWith(`/event/test-event-id/booking`)
		expect(bookingFactory.create).to.have.been.calledTwice
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

	it('Should call rest service when getting invitees', async () => {
		const eventId = 'eventId'
		restService.get = sinon.stub().returns([{learnerEmail: 'test1@test.com'}])
		inviteFactory.create = sinon.stub()

		await learnerRecord.getEventInvitees(eventId)

		expect(restService.get).to.have.been.calledOnceWith('/event/eventId/invitee')
		expect(inviteFactory.create).to.have.been.calledOnceWith({learnerEmail: 'test1@test.com'})
	})

	it('Should call rest service when posting learner', async () => {
		const eventId = 'eventId'
		const invite: Invite = new Invite()

		restService.post = sinon.stub()

		await learnerRecord.inviteLearner(eventId, invite)

		expect(restService.post).to.have.been.calledOnceWith('/event/eventId/invitee', invite)
	})
})
