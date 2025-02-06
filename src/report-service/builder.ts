import {ReportService} from './index'
import {ReportServiceClient} from './reportServiceClient'
import {OauthRestService} from '../lib/http/oauthRestService'
import {CourseService} from '../lib/courseService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {RestServiceConfig} from '../lib/http/restServiceConfig'
import {Auth} from '../identity/auth'
import {CslServiceClient} from '../csl-service/client'
import {ReportParameterFactory} from './model/course-completions/reportParameterFactory'
import {TimePeriodParamsFactory} from './model/course-completions/timePeriodParamsFactory'
import {CreateReportRequestReportParameterFactory} from './model/course-completions/createReportRequestParameterFactory'
import {GetCourseCompletionParameterFactory} from './model/course-completions/getCourseCompletionParameterFactory'
import {TableService} from '../templating/tableService'
import {ReportServicePageModelService} from './reportServicePageModelService'
import {ChartJsService} from './chartJsService'
import {ChartJsXaxisService} from './model/chartConfig/ChartJsXaxisService'
import {XAxisSettings} from './model/chartConfig/xAxisSettings'
import {FRONTEND} from '../config'

const hourXaxisSettings = new XAxisSettings("Time", "hA", "hour")
const dayXaxisSettings = new XAxisSettings("Date", "dddd Do MMMM", "day")
const monthXaxisSettings = new XAxisSettings("Month", "MMMM YYYY", "month")

export function buildReportService(restServiceConfig: RestServiceConfig, auth: Auth, courseService: CourseService,
								   organisationalUnitService: OrganisationalUnitService, cslServiceClient: CslServiceClient): ReportService {
	const chartJsAxisService = new ChartJsXaxisService([hourXaxisSettings, dayXaxisSettings, monthXaxisSettings],
		monthXaxisSettings)
	const chartService = new ChartJsService(chartJsAxisService)
	const oauth = new OauthRestService(restServiceConfig, auth)
	const client = new ReportServiceClient(oauth)
	const reportParameterFactory = new ReportParameterFactory(
		new TimePeriodParamsFactory(), new CreateReportRequestReportParameterFactory(FRONTEND.MANAGEMENT_UI_URL),
		new GetCourseCompletionParameterFactory()
	)
	const tableService = new TableService()
	const reportServicePageModelService = new ReportServicePageModelService(tableService, chartService)
	return new ReportService(client, courseService, organisationalUnitService, cslServiceClient, reportServicePageModelService,
		reportParameterFactory)
}
