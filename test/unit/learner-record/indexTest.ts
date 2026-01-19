import {LearnerRecord} from '../../../src/learner-record'
import {beforeEach} from 'mocha'
import {Auth} from '../../../src/identity/auth'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {RestServiceConfig} from 'lib/http/restServiceConfig'
import {OauthRestService} from '../../../src/lib/http/oauthRestService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Leaner Record Tests', () => {
	let learnerRecord: LearnerRecord
	let restService: OauthRestService

	const config = new RestServiceConfig('http://example.org', 60000)
	const oauthRestService = new OauthRestService(config, {} as Auth)

	beforeEach(() => {
		restService = <OauthRestService>{}

		learnerRecord = new LearnerRecord(oauthRestService)
		learnerRecord.restService = restService
	})

	it('should post new event to learner record', async () => {
		const eventId = 'eventId'
		const event = {
			uid: eventId,
			status: 'Active',
		}

		restService.postRequest = sinon.stub().returns(event)

		const response = await learnerRecord.createEvent(eventId)

		expect(response).to.equal(event)
		expect(restService.postRequest).to.have.been.calledOnceWith({url: '/event', data: event})
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
