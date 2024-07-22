/* tslint:disable:no-var-requires */
import * as config from './config'
process.env.TZ = config.SERVER_DEFAULT_TZ
export const appInsights = require('applicationinsights')
appInsights.setup(config.APPLICATIONINSIGHTS_CONNECTION_STRING)
.setAutoCollectConsole(true)

appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "lpg-management"
appInsights.start()


/* tslint:enable */

import { getLogger } from './utils/logger'
import * as express from 'express'

import {Properties} from 'ts-json-properties'
import {ApplicationContext} from './applicationContext'
import * as asyncHandler from 'express-async-handler'
import * as errorController from './lib/errorHandler'

Properties.initialize()

const logger = getLogger('server')
const {PORT = 3005} = process.env
const app = express()
const ctx = new ApplicationContext()
const { xss } = require('express-xss-sanitizer')
import * as middleware from './middleware/lpgManagementMiddleware'
import {buildReportService} from './report-service/builder'
import {OrganisationalUnitDomainsController} from './controllers/organisationalUnit/organisationalUnitDomainsController'
import {Controller} from './controllers/controller'
import {CourseCompletionsController} from './controllers/reporting/courseCompletionsController'
import {ReportingController} from './controllers/reporting/reportingController'
import {createConfig} from './lib/http/restServiceConfigFactory'

middleware.applyAll(app)

ctx.auth.configure(app)

const reportService = buildReportService(createConfig({
	url: config.REPORT_SERVICE.url,
	timeout: config.REPORT_SERVICE.timeout,
	detailedLogs: config.REPORT_SERVICE.detailedLogs
}), ctx.auth, ctx.courseService, ctx.organisationalUnitService, ctx.cslService)

const controllers: Controller[] = [
	new OrganisationalUnitDomainsController(ctx.organisationalUnitService),
	new ReportingController(reportService),
	new CourseCompletionsController(reportService)
]

app.use(ctx.addToResponseLocals())
app.use(ctx.courseController.router)
app.use(ctx.audienceController.router)
app.use(ctx.moduleController.router)
app.use(ctx.fileController.router)
app.use(ctx.youtubeModuleController.router)
app.use(ctx.linkModuleController.router)
app.use(ctx.faceToFaceController.router)
app.use(ctx.eventController.router)
app.use(ctx.organisationController.router)
app.use(ctx.searchController.router)
app.use(ctx.reportingController.router)
app.use(ctx.skillsController.router)
app.use(ctx.agencyTokenController.router)
logger.debug(`Registering ${controllers.length} controllers`)
controllers.forEach(c => {
	app.use(c.path, c.buildRouter())
})

app.use(xss())

app.get('/', function(req: any, res: any) {
	res.redirect('/content-management')
})

app.get('/log-out', asyncHandler(ctx.auth.logout()))

app.get('/content-management', asyncHandler(ctx.homeController.index()))

app.use(errorController.handleError)

const server = app.listen(PORT, () => logger.info(`LPG Management listening on port ${PORT}`))
server.setTimeout(config.SERVER_TIMEOUT_MS)
