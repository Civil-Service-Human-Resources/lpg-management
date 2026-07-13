import {DateStartEnd} from '../controllers/command/dateStartEndCommand'
import {OauthRestService} from '../lib/http/oauthRestService'

export class ReportServiceClient {

	constructor(private readonly _http: OauthRestService) {}

	private BOOKINGS_URL = "/bookings"
	private MODULES_URL = "/modules"

	private getToFromFromDateRange(dateRange: DateStartEnd) {
		return {
			from: dateRange.startDate,
			to: dateRange.endDate
		}
	}

	async getReportBookingInformation(dateRange: DateStartEnd, organisationId: number): Promise<string> {
		const params = this.getToFromFromDateRange(dateRange)
		const response = await this._http.getRequest<string>({url: this.BOOKINGS_URL, params, headers: {organisationId}})
		return response.data
	}

	async getReportLearnerRecord(dateRange: DateStartEnd): Promise<string> {
		const params = this.getToFromFromDateRange(dateRange)
		const response = await this._http.getRequest<string>({url: this.MODULES_URL, params})
		return response.data
	}

}
