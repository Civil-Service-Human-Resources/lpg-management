import {OauthRestService} from 'lib/http/oauthRestService'
import {CancelBookingDto} from './model/CancelBookingDto'
import {plainToInstance} from 'class-transformer'
import {Chart} from '../report-service/model/chart'
import {GetCourseCompletionParameters} from '../report-service/model/course-completions/getCourseCompletionParameters'
import {ReportExportRequestResponse} from '../report-service/model/reportExportRequestResponse'
import {ReportResponse} from './model/ReportResponse'
import {OrgRequiredLearningMap} from './model/orgRequiredLearningMap'
import {ApiParams} from 'lib/apiParams'
import {Report} from '../controllers/reporting/Report'
import {LearningPlanCache} from './learningPlanCache'
import {CancelEventResponse} from './model/CancelEventResponse'
import {BookingResponse} from './model/booklngResponse'
import {EventOverview} from './model/management/EventOverview'

export class CslServiceClient {

	private RESET_CACHE = '/reset-cache'
	private REGISTERED_LEARNER_OVERVIEW = "/admin/reporting/registered-learners/overview"
	private COURSE_COMPLETIONS_AGGREGATIONS_URL = "/admin/reporting/course-completions/generate-graph"
	private GET_REQUIRED_LEARNING_MAP_URL = "/learning/required/for-departments"

	constructor(private readonly _http: OauthRestService, private readonly learningPlanCache: LearningPlanCache) { }

	private getReportRequestUrl(type: Report) {
		const reportTypeUrl = type === Report.COURSE_COMPLETIONS ? 'course-completions' : 'registered-learners'
		return `/admin/reporting/${reportTypeUrl}/request-source-data`
	}

	private getReportDownloadUrl(type: Report) {
		const reportTypeUrl = type === Report.COURSE_COMPLETIONS ? 'course-completions' : 'registered-learners'
		return `/admin/reporting/${reportTypeUrl}/download-report`
	}

	async clearCourseCache(courseId: string) {
		await this._http.get(`${this.RESET_CACHE}/course/${courseId}`)
	}

	async getEventOverview(courseId: string, moduleId: string, eventId: string) {
		const response = await this._http.getRequest<EventOverview>(
			{
				url: `/admin/management/courses/${courseId}/modules/${moduleId}/events/${eventId}/overview`,
			})
		return plainToInstance(EventOverview, response)
	}

	async inviteLearnerToEvent(courseId: string, moduleId: string, eventId: string, learnerEmail: string) {
		await this._http.postRequest(
			{
				url: `/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/invite`,
				data: {
					learnerEmail
				}
			})
	}

	async cancelBooking(courseId: string, moduleId: string, eventId: string, bookingId: string, dto: CancelBookingDto) {
		const response = await this._http.postRequest<BookingResponse>(
			{
				url: `/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/bookings/${bookingId}/cancel_booking`,
				data: dto
			})
		await this.learningPlanCache.delete(plainToInstance(BookingResponse, response.data).learner)
	}

	async approveBooking(courseId: string, moduleId: string, eventId: string, bookingId: string) {
		const response = await this._http.postRequest<BookingResponse>(
			{
				url: `/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/bookings/${bookingId}/approve_booking`
			})
		await this.learningPlanCache.delete(plainToInstance(BookingResponse, response.data).learner)
	}

	async cancelEvent(courseId: string, moduleId: string, eventId: string, cancellationReason: string) {
		const response = await this._http.postRequest({
			url: `/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/cancel`,
			data: {
				reason: cancellationReason
			}
		})
		plainToInstance(CancelEventResponse, response.data)
			.learners.forEach(learner => {
				this.learningPlanCache.delete(learner)
		})
	}

	async getCourseCompletionsAggregationsChart(params: GetCourseCompletionParameters): Promise<Chart> {
		const response = await this._http.postRequest<Chart>({
			url: this.COURSE_COMPLETIONS_AGGREGATIONS_URL,
			data: params.getAsApiParams()
		})
		return plainToInstance(Chart, response.data)
	}

	async postReportExportRequest(reportType: Report, params: ApiParams): Promise<ReportExportRequestResponse> {
		const url = this.getReportRequestUrl(reportType)
		const response = await this._http.postRequest<ReportExportRequestResponse>({url, data: params.getAsApiParams()})
		return plainToInstance(ReportExportRequestResponse, response.data)
	}

	async downloadReportExport(reportType: Report, urlSlug: string): Promise<ReportResponse> {
		return await this._http.getFile(`${this.getReportDownloadUrl(reportType)}/${urlSlug}`)
	}

	async getRequiredLearningForOrganisations(organisationIds: number[]): Promise<OrgRequiredLearningMap> {
		const response = await this._http.getRequest({
			url: this.GET_REQUIRED_LEARNING_MAP_URL,
			params: {organisationIds}
		})
		return plainToInstance(OrgRequiredLearningMap, response.data)
	}

	async getRegisteredLearnerOverview() {
		return (await this._http.getRequest<{hasRequests: boolean}>({
			url: this.REGISTERED_LEARNER_OVERVIEW
		})).data
	}
}
