import {ReportService} from './index'
import {ReportServiceClient} from './reportServiceClient'
import {OauthRestService} from '../lib/http/oauthRestService'
import {CourseService} from '../lib/courseService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {RestServiceConfig} from '../lib/http/restServiceConfig'
import {Auth} from '../identity/auth'
import {CslServiceClient} from '../csl-service/client'
import {ChartService} from './chartService'

export function buildReportService(restServiceConfig: RestServiceConfig, auth: Auth, courseService: CourseService,
								   organisationalUnitService: OrganisationalUnitService, cslServiceClient: CslServiceClient): ReportService {
	const chartService = new ChartService()
	const oauth = new OauthRestService(restServiceConfig, auth)
	const client = new ReportServiceClient(oauth)
	return new ReportService(client, courseService, organisationalUnitService, cslServiceClient, chartService)
}
