import * as express from 'express'
import * as ctx from './applicationContext'
import * as session from 'express-session'
import * as sessionFileStore from 'session-file-store'
import * as cookieParser from 'cookie-parser'
import * as log4js from 'log4js'
import * as config from './config'
import * as serveStatic from 'serve-static'

const logger = log4js.getLogger('server')
const expressNunjucks = require('express-nunjucks')

const appRoot = require('app-root-path')

const {PORT = 3005} = process.env
const app = express()
const FileStore = sessionFileStore(session)

log4js.configure(config.LOGGING)

expressNunjucks(app, {})

app.set('views', appRoot + '/views')

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
		secret: 'dcOVe-ZW3ul77l23GiQSNbTJtMRio87G2yUOUAk_otcbL3uywfyLMZ9NBmDMuuOt',
		store: new FileStore({
			path: process.env.NOW ? `/tmp/sessions` : `.sessions`,
		}),
	})
)
app.use(serveStatic(appRoot + '/views/assets'))

app.use(cookieParser())

ctx.default.auth.configure(app)

app.get('/', ctx.default.homeController.index())

app.listen(PORT, () => logger.info(`LPG Management listening on port ${PORT}`))
