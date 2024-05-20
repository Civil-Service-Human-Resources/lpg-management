import {ReportService} from './index'
import {ReportServiceClient} from './reportServiceClient'
import {OauthRestService} from '../lib/http/oauthRestService'
import {CourseService} from '../lib/courseService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {RestServiceConfig} from '../lib/http/restServiceConfig'
import {Auth} from '../identity/auth'

export function buildReportService(restServiceConfig: RestServiceConfig, auth: Auth, courseService: CourseService,
								   organisationalUnitService: OrganisationalUnitService): ReportService {
	const oauth = new OauthRestService(restServiceConfig, auth)
	const client = new ReportServiceClient(oauth)
	return new ReportService(client, courseService, organisationalUnitService)
}
