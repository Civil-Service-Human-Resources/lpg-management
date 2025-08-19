import {OauthRestService} from 'lib/http/oauthRestService'
import {CancelBookingDto} from './model/CancelBookingDto'
import {plainToInstance} from 'class-transformer'
import {EventResponse} from './model/EventResponse'
import {Chart} from '../report-service/model/chart'
import {CreateReportRequestParams} from '../report-service/model/course-completions/createReportRequestParams'
import {GetCourseCompletionParameters} from '../report-service/model/course-completions/getCourseCompletionParameters'
import {
	RequestCourseCompletionExportRequestResponse
} from '../report-service/model/requestCourseCompletionExportRequestResponse'
import {ReportResponse} from './model/ReportResponse'
import { FormattedOrganisationListResponse } from './model/FormattedOrganisationListResponse'
import {GetOrganisationsFormattedParams} from './model/getOrganisationsFormattedParams'
import {OrgRequiredLearningMap} from './model/orgRequiredLearningMap'

export class CslServiceClient {

	private RESET_CACHE = '/reset-cache'
	private COURSE_COMPLETIONS_AGGREGATIONS_URL = "/admin/reporting/course-completions/generate-graph"
	private COURSE_COMPLETIONS_DOWNLOAD_SOURCE_REQUEST_URL = "/admin/reporting/course-completions/request-source-data"
	private COURSE_COMPLETIONS_DOWNLOAD_SOURCE_URL = "/admin/reporting/course-completions/download-report"
	private FORMATTED_LIST_URL = "/organisations/formatted_list"
	private GET_REQUIRED_LEARNING_MAP_URL = "/learning/required/for-departments"

	constructor(private readonly _http: OauthRestService) { }

	async clearCourseCache(courseId: string) {
		await this._http.get(`${this.RESET_CACHE}/course/${courseId}`)
	}

	async cancelBooking(courseId: string, moduleId: string, eventId: string, bookingId: string, dto: CancelBookingDto) {
		const response = await this._http.postRequest<EventResponse>(
			{
				url: `/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/bookings/${bookingId}/cancel_booking`,
				data: dto
			})
		return plainToInstance(EventResponse, response.data)
	}

	async approveBooking(courseId: string, moduleId: string, eventId: string, bookingId: string) {
		const response = await this._http.postRequest<EventResponse>(
			{
				url: `/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/bookings/${bookingId}/approve_booking`
			})
		return plainToInstance(EventResponse, response.data)
	}

	async getCourseCompletionsAggregationsChart(params: GetCourseCompletionParameters): Promise<Chart> {
		const response = await this._http.postRequest<Chart>({
			url: this.COURSE_COMPLETIONS_AGGREGATIONS_URL,
			data: params.getAsApiParams()
		})
		return plainToInstance(Chart, response.data)
	}

	async postCourseCompletionsExportRequest(params: CreateReportRequestParams): Promise<RequestCourseCompletionExportRequestResponse> {
		const response = await this._http.postRequest<RequestCourseCompletionExportRequestResponse>({url: this.COURSE_COMPLETIONS_DOWNLOAD_SOURCE_REQUEST_URL, data: params.getAsApiParams()})
		return plainToInstance(RequestCourseCompletionExportRequestResponse, response.data)
	}

	async downloadCourseCompletionsReport(urlSlug: string): Promise<ReportResponse> {
		return await this._http.getFile(`${this.COURSE_COMPLETIONS_DOWNLOAD_SOURCE_URL}/${urlSlug}`)
	}

	async cancelEvent(courseId: string, moduleId: string, eventId: string, cancellationReason: string) {
		return await this._http.postRequest({
			url: `/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/cancel`,
			data: {
				reason: cancellationReason
			}
		})
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
}
