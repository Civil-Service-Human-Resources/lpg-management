import {ReportService} from './index'
import {ReportServiceClient} from './reportServiceClient'
import {OauthRestService} from '../lib/http/oauthRestService'
import {CourseService} from '../lib/courseService'
import {RestServiceConfig} from '../lib/http/restServiceConfig'
import {Auth} from '../identity/auth'
import {CslServiceClient} from '../csl-service/client'
import {TimePeriodParamsFactory} from './model/course-completions/timePeriodParamsFactory'
import {TableService} from '../templating/tableService'
import {ReportServicePageModelService} from './reportServicePageModelService'
import {ChartJsService} from './chartJsService'
import {ChartJsXaxisService} from './model/chartConfig/ChartJsXaxisService'
import {XAxisSettings} from './model/chartConfig/xAxisSettings'
import {FRONTEND} from '../config'
import {CslService} from '../csl-service/service/cslService'
import {ReportParameterFactory} from './model/reportParameterFactory'
import {ReportExportService} from '../controllers/reporting/reportExportService'
import {CourseCompletionService} from './courseCompletionService'
import {Controller} from '../controllers/controller'
import {ReportingController} from '../controllers/reporting/reportingController'
import {CourseCompletionsController} from '../controllers/reporting/courseCompletionsController'
import {RegisteredLearnersController} from '../controllers/reporting/registeredLearnersController'
import {OrganisationPageModelService} from '../controllers/reporting/organisationPageModelService'

const hourXaxisSettings = new XAxisSettings("Time", "hA", "hour")
const dayXaxisSettings = new XAxisSettings("Date", "dddd Do MMMM", "day")
const monthXaxisSettings = new XAxisSettings("Month", "MMMM YYYY", "month")

export function buildReportingControllers(restServiceConfig: RestServiceConfig, auth: Auth, courseService: CourseService,
										  cslServiceClient: CslServiceClient, cslService: CslService): Controller[] {
	const chartJsAxisService = new ChartJsXaxisService([hourXaxisSettings, dayXaxisSettings, monthXaxisSettings],
		monthXaxisSettings)
	const oauth = new OauthRestService(restServiceConfig, auth)
	const client = new ReportServiceClient(oauth)
	const timePeriodParamsFactory = new TimePeriodParamsFactory()
	const chartService = new ChartJsService(chartJsAxisService)
	const tableService = new TableService()
	const reportServicePageModelService = new ReportServicePageModelService(tableService, chartService)
	const reportParameterFactory = new ReportParameterFactory(FRONTEND.MANAGEMENT_UI_URL, timePeriodParamsFactory)
	const courseCompletionService = new CourseCompletionService(courseService, cslServiceClient, reportServicePageModelService, reportParameterFactory)
	const reportExportService = new ReportExportService(cslServiceClient, reportParameterFactory)
	const organisationPageModelService = new OrganisationPageModelService(cslService)

	return [new ReportingController(new ReportService(client)),
		new CourseCompletionsController(courseCompletionService, reportExportService, organisationPageModelService),
		new RegisteredLearnersController(organisationPageModelService, reportExportService)]
}
