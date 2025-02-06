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

export class CslServiceClient {

	private COURSE_COMPLETIONS_AGGREGATIONS_URL = "/admin/reporting/course-completions/generate-graph"
	private COURSE_COMPLETIONS_DOWNLOAD_SOURCE_REQUEST_URL = "/admin/reporting/course-completions/request-source-data"
	private COURSE_COMPLETIONS_DOWNLOAD_SOURCE_URL = "/admin/reporting/course-completions/download-report"

	constructor(private readonly _http: OauthRestService) { }

	async clearCourseCache(courseId: string) {
		await this._http.get(`/reset-cache/course/${courseId}`)
	}

	async cancelBooking(courseId: string, moduleId: string, eventId: string, bookingId: string, dto: CancelBookingDto) {
		const response = await this._http.postWithoutFollowing<EventResponse>(
			`/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/bookings/${bookingId}/cancel_booking`,
			dto)
		return plainToInstance(EventResponse, response.data)
	}

	async approveBooking(courseId: string, moduleId: string, eventId: string, bookingId: string) {
		const response = await this._http.postWithoutFollowing<EventResponse>(
			`/admin/courses/${courseId}/modules/${moduleId}/events/${eventId}/bookings/${bookingId}/approve_booking`,
			null)
		return plainToInstance(EventResponse, response.data)
	}

	async getCourseCompletionsAggregationsChart(params: GetCourseCompletionParameters): Promise<Chart> {
		return plainToInstance(Chart, (await this._http.postWithoutFollowing<Chart>(this.COURSE_COMPLETIONS_AGGREGATIONS_URL, params.getAsApiParams())).data)
	}

	async postCourseCompletionsExportRequest(params: CreateReportRequestParams): Promise<RequestCourseCompletionExportRequestResponse> {
		return plainToInstance(RequestCourseCompletionExportRequestResponse, (await this._http.postWithoutFollowing<RequestCourseCompletionExportRequestResponse>(this.COURSE_COMPLETIONS_DOWNLOAD_SOURCE_REQUEST_URL, params.getAsApiParams())).data)
	}

	async downloadCourseCompletionsReport(urlSlug: string): Promise<ReportResponse> {
		console.log(`${this.COURSE_COMPLETIONS_DOWNLOAD_SOURCE_URL}/${urlSlug}`)
		return await this._http.getFile(`${this.COURSE_COMPLETIONS_DOWNLOAD_SOURCE_URL}/${urlSlug}`)
	}
}
