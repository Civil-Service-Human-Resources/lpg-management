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
import {DomainUpdateSuccessResponse} from '../csrs/model/page/domainUpdateSuccess'
import {OrganisationalUnitPageModel} from '../csrs/model/organisationalUnitPageModel'

export class CslServiceClient {

	private RESET_CACHE = '/reset-cache'
	private REGISTERED_LEARNER_OVERVIEW = "/admin/reporting/registered-learners/overview"
	private COURSE_COMPLETIONS_AGGREGATIONS_URL = "/admin/reporting/course-completions/generate-graph"
	private FORMATTED_LIST_URL = "/organisations/formatted_list"
	private GET_REQUIRED_LEARNING_MAP_URL = "/learning/required/for-departments"
	private ORGANISATIONS_URL = "/organisations"

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

	async deleteOrganisationalUnit(organisationalUnitId: number) {
		await this._http.deleteRequest({
			url: `${this.ORGANISATIONS_URL}/${organisationalUnitId}`
		})
	}

	async addDomainToOrganisation(organisationalUnitId: number, domain: string): Promise<DomainUpdateSuccessResponse> {
		return (await this._http.postRequest<DomainUpdateSuccessResponse>({
			url: `${this.ORGANISATIONS_URL}/${organisationalUnitId}/domains`,
			data: {
				domain
			}
		})).data
	}

	async removeDomainFromOrganisation(organisationalUnitId: number, domainId: number, includeSubOrganisations: boolean): Promise<DomainUpdateSuccessResponse> {
		return (await this._http.deleteRequest<DomainUpdateSuccessResponse>({
			url: `${this.ORGANISATIONS_URL}/${organisationalUnitId}/domains/${domainId}`,
			params: {
				includeSubOrganisations
			}
		})).data
	}

	async updateOrganisationalUnit(
		organisationalUnitId: number,
		organisationalUnit: OrganisationalUnitPageModel
	): Promise<void> {
		const parent = organisationalUnit.parentId
			? `${organisationalUnit.parentId}`
			: null;

		await this._http.putRequest<void>({
			url: `${this.ORGANISATIONS_URL}/${organisationalUnitId}`,
			data: {
				code: organisationalUnit.code,
				name: organisationalUnit.name,
				abbreviation: organisationalUnit.abbreviation,
				parent: parent
			}
		});
	}
}
