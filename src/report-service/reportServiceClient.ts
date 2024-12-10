import {OauthRestService} from 'lib/http/oauthRestService'
import {getLogger} from '../utils/logger'
import {DateStartEnd} from '../controllers/command/dateStartEndCommand'

export class ReportServiceClient {

	private logger = getLogger('ReportServiceClient')

	constructor(private readonly _http: OauthRestService) {}

	private BOOKINGS_URL = "/bookings"
	private MODULES_URL = "/modules"

	private async getReport(url: string, dateRange: DateStartEnd) {
		const params = {
			from: dateRange.startDate,
			to: dateRange.endDate
		}
		this.logger.info(`Generating report request for URL: ${url} and params: ${JSON.stringify(params)}`)
		return await this._http.getWithAuthAndConfig(url, {params})
	}

	async getReportBookingInformation(dateRange: DateStartEnd): Promise<string> {
		return await this.getReport(this.BOOKINGS_URL, dateRange)
	}

	async getReportLearnerRecord(dateRange: DateStartEnd): Promise<string> {
		return await this.getReport(this.MODULES_URL, dateRange)
	}

}
