import moment = require('moment')
import {ReportService} from '../../report-service'
import {getRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {DateStartEndCommand} from '../command/dateStartEndCommand'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {Report, ReportType} from './Report'
import {Controller} from '../controller'
import {CompoundRoleBase, reporterRole} from '../../identity/identity'

export class ReportingController extends Controller {

	public constructor (protected reportService: ReportService) {
		super("/reporting", "reportingController")
	}

	private reportMap: Map<Report, ReportType> = new Map<Report, ReportType>([
		[Report.BOOKING, new ReportType("Booking_information")],
		[Report.LEARNER_RECORD, new ReportType("Learner_record")]
	])

	protected getRequiredRoles(): CompoundRoleBase[] {
		return reporterRole.compoundRoles
	}

	private reportGeneratingPostRequest(url: string, reportType: Report) {
		return postRequestWithBody(url, this.generateReport(reportType),{
			dtoClass: DateStartEndCommand,
			onError: {
				behaviour: BehaviourOnError.RENDER_TEMPLATE,
				path: `page/reporting/index`,
				pageModelKey: reportType === Report.BOOKING ? 'bookingPageModel' : 'learnerRecordPageModel'
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
				bookingPageModel: new DateStartEndCommand(),
				learnerRecordPageModel: new DateStartEndCommand()
			})
		}
	}

	generateReport(reportType: Report) {
		return async (request: Request, response: Response, next: NextFunction) => {
			const dateRange: DateStartEndCommand = response.locals.input
			const report = await this.reportService.getReport(reportType, {
				startDate: dateRange.startDate!,
				endDate: dateRange.endDate!
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
		}
	}

}
