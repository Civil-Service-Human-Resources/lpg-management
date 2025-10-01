import {Request, Response} from 'express'
import {CslServiceClient} from '../../csl-service/client'
import {ChooseOrganisationSession} from './model/chooseOrganisationSession'
import {Report} from './Report'
import {CourseCompletionsSession} from './model/courseCompletionsSession'
import {ReportParameterFactory} from '../../report-service/model/reportParameterFactory'

export class ReportExportService {

	constructor(private cslServiceClient: CslServiceClient,
				private reportParameterFactory: ReportParameterFactory) {
	}

	public async getRegisteredLearnerOverview() {
		return this.cslServiceClient.getRegisteredLearnerOverview()
	}

	public async submitRegisteredLearnerExportRequest(session: ChooseOrganisationSession) {
		const params = this.reportParameterFactory.generateRegisteredLearnerReportRequestParams(session)
		return await this.cslServiceClient.postReportExportRequest(Report.REGISTERED_LEARNERS, params)
	}

	public async submitCourseCompletionExportRequest(session: CourseCompletionsSession) {
		const params = this.reportParameterFactory.generateCourseCompletionReportRequestParams(session)
		return await this.cslServiceClient.postReportExportRequest(Report.COURSE_COMPLETIONS, params)
	}

	public downloadExtract(reportType: Report) {
		return async (request: Request, response: Response) => {
			const reportResponse = await this.cslServiceClient.downloadReportExport(reportType, request.params.urlSlug)
			if (reportResponse.file === null) {
				if (reportResponse.code === 403) {
					return response.render("page/unauthorised")
				}
				if (reportResponse.code === 404) {
					return response.render("page/not-found")
				}
			} else {
				const report = reportResponse.file
				response.set(report.getHeaders())
				response.status(200)
				response.end(report.data)
			}
		}
	}
}
