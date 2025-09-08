import {ReportServiceClient} from './reportServiceClient'
import {Report} from '../controllers/reporting/Report'
import {DateStartEnd} from '../controllers/command/dateStartEndCommand'

export class ReportService {

	constructor(private client: ReportServiceClient) {
	}

	async getReport(reportType: Report, dateRange: DateStartEnd): Promise<Buffer> {
		let report = ""
		switch (reportType) {
			case Report.LEARNER_RECORD: {
				report = await this.client.getReportLearnerRecord(dateRange)
				break
			}
			case Report.BOOKING: {
				report = await this.client.getReportBookingInformation(dateRange)
				break
			}
		}
		return Buffer.from(report, 'binary')
	}
}
