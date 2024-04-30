import * as express from 'express'
import {Middleware} from '../../src/middleware/middleware'
import {LocaleMiddleware} from '../../src/middleware/locale'
import {AssetMiddleware} from '../../src/middleware/asset'
import {RequestMiddleware} from '../../src/middleware/requestMiddleware'
import {NunjucksMiddleware} from '../../src/middleware/nunjucks'
import {Identity} from '../../src/identity/identity'
import * as session from 'express-session'
import * as cookieParser from 'cookie-parser'
import {Express} from 'express'


let app: express.Express = express()
app.use((req, res, next) => {
	let roles: string[] = []
	const roleHeader = req.header("roles")
	if(roleHeader !== undefined) {
		roles = roleHeader.split(",")
	}
	const identity = new Identity("testUid", 'user@domain.com', roles, "accessToken")
	req.user = identity
	res.locals.identity = identity
	next()
})
const middleware: Middleware[] = [
	new LocaleMiddleware(),
	new NunjucksMiddleware(),
	new AssetMiddleware(),
	new RequestMiddleware()
]
middleware.forEach(m => {
	m.applyMiddleware(app)
})

const applySessionToApp = (sessionableApp: Express) => {
	sessionableApp.use(session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true
	}))
	sessionableApp.use(cookieParser())
	return sessionableApp
}

app = applySessionToApp(app)

export const getApp = () => {
	return app
}

export const createSubApp = () => {
	const subApp: express.Express = express()
	return applySessionToApp(subApp)
}
