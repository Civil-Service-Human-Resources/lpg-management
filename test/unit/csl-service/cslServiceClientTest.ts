import {beforeEach, describe} from 'mocha'
import {CslServiceClient} from '../../../src/csl-service/client'
import {OauthRestService} from 'lib/http/oauthRestService'
import * as sinon from 'sinon'
import {CancelBookingDto} from '../../../src/csl-service/model/CancelBookingDto'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {
	GetCourseCompletionParameters,
} from '../../../src/report-service/model/course-completions/getCourseCompletionParameters'
import {TimePeriodParameters} from '../../../src/report-service/model/course-completions/timePeriodParameters'
import {
	CourseCompletionReportRequestParams,
} from '../../../src/report-service/model/course-completions/courseCompletionReportRequestParams'
import {Report} from '../../../src/controllers/reporting/Report'

import {LearningPlanCache} from '../../../src/csl-service/learningPlanCache'
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
var advancedFormat = require("dayjs/plugin/advancedFormat");

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

chai.use(sinonChai)
describe('CslServiceClient', function() {
	let restService: OauthRestService
	let cache: LearningPlanCache
	let client: CslServiceClient

	beforeEach(() => {
		restService = <OauthRestService>{}
		cache = <LearningPlanCache>{}
		cache.delete = sinon.stub().resolves()
		client = new CslServiceClient(restService, cache)
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
			restService.postRequest = sinon.stub().resolves({
				data: mockResponseData
			})
		})
		it('Should cancel a booking', async () => {
			const dto = new CancelBookingDto("PAYMENT")
			await client.cancelBooking("courseId", "moduleId", "eventId", "1",
				dto)
			const expUrl = `/admin/courses/courseId/modules/moduleId/events/eventId/bookings/1/cancel_booking`
			expect(restService.postRequest).to.have.been.calledOnceWith({url: expUrl, data: dto})
		})
		it('Should approve a booking', async () => {
			await client.approveBooking("courseId", "moduleId", "eventId", "1")
			const expUrl = `/admin/courses/courseId/modules/moduleId/events/eventId/bookings/1/approve_booking`
			expect(restService.postRequest).to.have.been.calledOnceWith({url: expUrl})
		})
	})

	describe('Course completions calls with correct responses', () => {
		const time = dayjs("2024-10-10T10:00:00").tz("UTC", true)
		const timePeriod = new TimePeriodParameters(time, time)
		const tz = "+1"
		it('Should get the course completion aggregation page data', async () => {
			restService.postRequest = sinon.stub().resolves({
				data: {

				}
			})
			const params = new GetCourseCompletionParameters(timePeriod, tz,
				["course1"], [1])
			const expUrl = `/admin/reporting/course-completions/generate-graph`
			await client.getCourseCompletionsAggregationsChart(params)
			expect(restService.postRequest).to.have.been.calledOnceWith({url: expUrl,
			data: {
				startDate: '2024-10-10T10:00:00',
				endDate: '2024-10-10T10:00:00',
				timezone: '+1',
				courseIds: ['course1'],
				selectedOrganisationIds: [1],
				gradeIds: undefined,
				professionIds: undefined,
			}
		})
		})
		it('Should submit a new report data request', async () => {
			restService.postRequest = sinon.stub().resolves({
				data: {

				}
			})
			const getCourseCompletionParameters = new GetCourseCompletionParameters(timePeriod, tz, ["course1"], [1])
			const params = new CourseCompletionReportRequestParams("userId", "full name", "userEmail",
				"https://baseUrl.com/reporting/course-completions/download-report", getCourseCompletionParameters)
			const expUrl = `/admin/reporting/course-completions/request-source-data`
			await client.postReportExportRequest(Report.COURSE_COMPLETIONS, params)
			expect(restService.postRequest).to.have.been.calledOnceWith({url: expUrl,
				data: {
					userId: "userId",
					downloadBaseUrl: "https://baseUrl.com/reporting/course-completions/download-report",
					fullName: "full name",
					userEmail: "userEmail",
					startDate: "2024-10-10T10:00:00",
					endDate: "2024-10-10T10:00:00",
					timezone: "+1",
					courseIds: ["course1"],
					selectedOrganisationIds: [1],
					gradeIds: undefined,
					professionIds: undefined,
				}})
		})
	})

})
