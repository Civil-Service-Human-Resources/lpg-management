import {OauthRestService} from 'lib/http/oauthRestService'
import {CancelBookingDto} from './model/CancelBookingDto'
import {plainToInstance} from 'class-transformer'
import {EventResponse} from './model/EventResponse'
import {GetCourseAggregationParameters} from '../report-service/model/getCourseAggregationParameters'
import {Chart} from '../report-service/model/chart'

export class CslServiceClient {

	private COURSE_COMPLETIONS_AGGREGATIONS_URL = "/admin/reporting/course-completions/generate-graph"

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

	async getCourseCompletionsAggregationsChart(params: GetCourseAggregationParameters): Promise<Chart> {
		return plainToInstance(Chart, (await this._http.postWithoutFollowing<Chart>(this.COURSE_COMPLETIONS_AGGREGATIONS_URL, params.getAsApiParams())).data)
	}
}
