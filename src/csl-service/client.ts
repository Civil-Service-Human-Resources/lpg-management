import {OauthRestService} from 'lib/http/oauthRestService'
import {CancelBookingDto} from './model/CancelBookingDto'
import {plainToInstance} from 'class-transformer'
import {Chart} from '../report-service/model/chart'
import {GetCourseCompletionParameters} from '../report-service/model/course-completions/getCourseCompletionParameters'
import {ReportExportRequestResponse} from '../report-service/model/reportExportRequestResponse'
import {ReportResponse} from './model/ReportResponse'
import {FormattedOrganisationListResponse} from './model/FormattedOrganisationListResponse'
import {GetOrganisationsFormattedParams} from './model/getOrganisationsFormattedParams'
import {OrgRequiredLearningMap} from './model/orgRequiredLearningMap'
import {ApiParams} from 'lib/apiParams'
import {Report} from '../controllers/reporting/Report'
import {LearningPlanCache} from './learningPlanCache'
import {CancelEventResponse} from './model/CancelEventResponse'
import {BookingResponse} from './model/booklngResponse'

export class CslServiceClient {

	private RESET_CACHE = '/reset-cache'
	private REGISTERED_LEARNER_OVERVIEW = "/admin/reporting/registered-learners/overview"
	private COURSE_COMPLETIONS_AGGREGATIONS_URL = "/admin/reporting/course-completions/generate-graph"
	private COURSE_COMPLETIONS_DOWNLOAD_SOURCE_URL = "/admin/reporting/course-completions/download-report"
	private FORMATTED_LIST_URL = "/organisations/formatted_list"
	private GET_REQUIRED_LEARNING_MAP_URL = "/learning/required/for-departments"

	constructor(private readonly _http: OauthRestService, private readonly learningPlanCache: LearningPlanCache) { }

	private getReportRequestUrl(type: Report) {
		const reportTypeUrl = type === Report.COURSE_COMPLETIONS ? 'course-completions' : 'registered-learners'
		return `/admin/reporting/${reportTypeUrl}/request-source-data`
	}

	async clearCourseCache(courseId: string) {
		await this._http.get(`${this.RESET_CACHE}/course/${courseId}`)
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

	async downloadCourseCompletionsReport(urlSlug: string): Promise<ReportResponse> {
		return await this._http.getFile(`${this.COURSE_COMPLETIONS_DOWNLOAD_SOURCE_URL}/${urlSlug}`)
	}

	async getFormattedOrganisationList(params?: GetOrganisationsFormattedParams): Promise<FormattedOrganisationListResponse> {
		const response = await this._http.getRequest({
			url: this.FORMATTED_LIST_URL,
			params
		})

		return plainToInstance(FormattedOrganisationListResponse, response.data)
	}

	async getRequiredLearningForOrganisations(organisationIds: number[]): Promise<OrgRequiredLearningMap> {
		const response = await this._http.getRequest({
			url: this.GET_REQUIRED_LEARNING_MAP_URL,
			params: {organisationIds}
		})
		return plainToInstance(OrgRequiredLearningMap, response.data)
	}

	async clearOrganisationCache() {
		await this._http.getRequest({
			url: `${this.RESET_CACHE}/organisations`
		})
	}

	async getRegisteredLearnerOverview() {
		return (await this._http.getRequest<{hasRequests: boolean}>({
			url: this.REGISTERED_LEARNER_OVERVIEW
		})).data
	}
}
