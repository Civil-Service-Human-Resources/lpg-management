import {OauthRestService} from 'lib/http/oauthRestService'
import {DateStartEnd} from '../learning-catalogue/model/dateStartEnd'

export class ReportServiceClient {

	constructor(private readonly _http: OauthRestService) {}

	private BOOKINGS_URL = "/bookings"
	private MODULES_URL = "/modules"

	private async getReport(url: string, dateRange: DateStartEnd) {
		return await this._http.getWithAuthAndConfig(url,
			{
				params: {
					from: dateRange.startDate,
					to: dateRange.endDate
				}
			})
	}

	async getReportBookingInformation(dateRange: DateStartEnd): Promise<string> {
		return await this.getReport(this.BOOKINGS_URL, dateRange)
	}

	async getReportLearnerRecord(dateRange: DateStartEnd): Promise<string> {
		return await this.getReport(this.MODULES_URL, dateRange)
	}

}
