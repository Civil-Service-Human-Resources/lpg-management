import moment = require('moment')
import {ReportService} from '../../report-service'
import {getRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {PlaceholderDate} from '../../learning-catalogue/model/placeholderDate'
import {DateStartEndCommand} from '../command/dateStartEndCommand'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {ReportingControllerBase} from './reportingControllerBase'
import {Report, ReportType} from './Report'

export class ReportingController extends ReportingControllerBase {

	public constructor (protected reportService: ReportService) {
		super("reportingController", reportService)
	}

	private reportMap: Map<Report, ReportType> = new Map<Report, ReportType>([
		[Report.BOOKING, new ReportType("Booking_information")],
		[Report.LEARNER_RECORD, new ReportType("LEARNER_RECORD")]
	])

	private reportGeneratingPostRequest(url: string, reportType: Report) {
		return postRequestWithBody(url, this.generateReport(reportType),{
			dtoClass: DateStartEndCommand,
			onError: {
				behaviour: BehaviourOnError.REDIRECT,
				path: `/reporting`
			}
		})
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/', this.getReports()),
			this.reportGeneratingPostRequest('/booking-information', Report.BOOKING),
			this.reportGeneratingPostRequest('/learner-record', Report.LEARNER_RECORD)
		]
	}

	getReports() {
		return async (request: Request, response: Response) => {
			response.render('page/reporting/index', {
				placeholder: new PlaceholderDate(),
			})
		}
	}

	generateReport(reportType: Report) {
		return async (request: Request, response: Response, next: NextFunction) => {
			const dateRange: DateStartEndCommand = request.body
			try {
				const report = await this.reportService.getReport(reportType, {
					endDate: dateRange.getEndDate(),
					startDate: dateRange.getStartDate()
				})
				const metadata = this.reportMap.get(reportType)
				if (metadata) {
					const filename = metadata.fileName.concat(moment().toISOString())
					response.writeHead(200, {
						'Content-type': 'text/csv',
						'Content-disposition': `attachment;filename=${filename}.csv`,
						'Content-length': report.length,
					})
					response.end(report)
				}
			} catch (error) {
				throw new Error(error)
			}
		}
	}

}
