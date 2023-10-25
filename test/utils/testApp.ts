import * as express from 'express'
import {Middleware} from '../../src/middleware/middleware'
import {LocaleMiddleware} from '../../src/middleware/locale'
import {AssetMiddleware} from '../../src/middleware/asset'
import {RequestMiddleware} from '../../src/middleware/requestMiddleware'
import {NunjucksMiddleware} from '../../src/middleware/nunjucks'
import {Identity} from '../../src/identity/identity'

const app: express.Express = express()
app.use((req, res, next) => {
	let roles: string[] = []
	const roleHeader = req.header("roles")
	if(roleHeader !== undefined) {
		roles = roleHeader.split(",")
	}
	const identity = new Identity("testUid", roles, "accessToken")
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


// Default identity

export const getApp = () => {
	return app
}
