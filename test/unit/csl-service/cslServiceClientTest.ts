import {beforeEach, describe} from 'mocha'
import {CslServiceClient} from '../../../src/csl-service/client'
import {OauthRestService} from 'lib/http/oauthRestService'
import * as sinon from 'sinon'
import {CancelBookingDto} from '../../../src/csl-service/model/CancelBookingDto'
import {expect} from 'chai'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'

chai.use(sinonChai)
describe('CslServiceClient', function() {
	let restService: OauthRestService
	let client: CslServiceClient

	beforeEach(() => {
		restService = <OauthRestService>{}
		client = new CslServiceClient(restService)
	})

	describe('Event API calls with correct responses', () => {
		let mockResponseData = {
			courseTitle: "course title",
			moduleTitle: "module title",
			courseId: "courseId",
			moduleId: "moduleId",
			eventId: "eventId",
			eventTimestamp: "2024-01-01 10:00:00",
		}
		beforeEach(() => {
			restService.postWithoutFollowing = sinon.stub().resolves({
				data: mockResponseData
			})
		})
		it('Should cancel a booking', async () => {
			const dto = new CancelBookingDto("PAYMENT")
			await client.cancelBooking("courseId", "moduleId", "eventId", "1",
				dto)
			const expUrl = `/admin/courses/courseId/modules/moduleId/events/eventId/bookings/1/cancel_booking`
			expect(restService.postWithoutFollowing).to.have.been.calledOnceWith(expUrl, dto)
		})
		it('Should approve a booking', async () => {
			await client.approveBooking("courseId", "moduleId", "eventId", "1")
			const expUrl = `/admin/courses/courseId/modules/moduleId/events/eventId/bookings/1/approve_booking`
			expect(restService.postWithoutFollowing).to.have.been.calledOnceWith(expUrl)
		})
	})

})
