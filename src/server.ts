import * as express from 'express'
import * as session from 'express-session'
import * as sessionFileStore from 'session-file-store'
import * as cookieParser from 'cookie-parser'
import * as log4js from 'log4js'
import * as config from './config'
import * as serveStatic from 'serve-static'
import {Properties} from 'ts-json-properties'
import {ApplicationContext} from './applicationContext'
import * as bodyParser from 'body-parser'

Properties.initialize()

const logger = log4js.getLogger('server')
const nunjucks = require('nunjucks')
const appRoot = require('app-root-path')
const FileStore = sessionFileStore(session)
const {PORT = 3005} = process.env
const app = express()
const ctx = new ApplicationContext()
const i18n = require('i18n-express')

app.use(
	i18n({
		translationsPath: appRoot + '/src/locale',
		siteLangs: ['en'],
		textsVarName: 'i18n',
	})
)

nunjucks.configure(
	[
		appRoot + '/views',
		appRoot + '/node_modules/govuk-frontend/',
		appRoot + '/node_modules/govuk-frontend/components',
	],
	{
		autoescape: true,
		express: app,
	}
)
app.set('view engine', 'html')

app.use('/assets', serveStatic(appRoot + '/node_modules/govuk-frontend/assets'))
app.use('/js', serveStatic(appRoot + '/views/assets/js'))
app.use(serveStatic(appRoot + '/dist/views/assets'))
app.use(
	'/govuk-frontend',
	serveStatic(appRoot + '/node_modules/govuk-frontend/')
)

log4js.configure(config.LOGGING)

app.use(
	session({
		cookie: {
			httpOnly: true,
			maxAge: 31536000,
			secure: false,
		},
		name: 'lpg-management',
		resave: true,
		saveUninitialized: true,
		secret:
			'dcOVe-ZW3ul77l23GiQSNbTJtMRio87G2yUOUAk_otcbL3uywfyLMZ9NBmDMuuOt',
		store: new FileStore({
			path: process.env.NOW ? `/tmp/sessions` : `.sessions`,
		}),
	})
)
app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

ctx.auth.configure(app)
app.use(ctx.addToResponseLocals())

app.get('/', function(req, res) {
	res.redirect('/content-management')
})

app.get('/content-management', ctx.homeController.index())
app.get(
	'/content-management/course/:courseId',
	ctx.courseController.courseOverview()
)
app.get(
	'/content-management/add-course/',
	ctx.courseController.getCourseTitle(false)
)
app.get(
	'/content-management/edit-course/:courseId',
	ctx.courseController.getCourseTitle(true)
)
app.post(
	'/content-management/add-course',
	ctx.courseController.setCourseTitle(false)
)
app.post(
	'/content-management/edit-course/:courseId',
	ctx.courseController.setCourseTitle(true)
)
app.get(
	'/content-management/course-preview/:courseId',
	ctx.courseController.coursePreview()
)

app.get(
	'/content-management/add-course-details',
	ctx.courseController.getCourseDetails(false)
)
app.get(
	'/content-management/edit-course-details/:courseId',
	ctx.courseController.getCourseDetails(true)
)
app.post(
	'/content-management/add-course-details',
	ctx.courseController.setCourseDetails(false)
)
app.post(
	'/content-management/edit-course-details/:courseId',
	ctx.courseController.setCourseDetails(true)
)
app.get('/add-module', ctx.courseController.addModule())
app.get('/add-module-blog', ctx.courseController.addModuleBlog())

app.listen(PORT, () => logger.info(`LPG Management listening on port ${PORT}`))
