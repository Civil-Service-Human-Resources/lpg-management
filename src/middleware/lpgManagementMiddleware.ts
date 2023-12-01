import {LocaleMiddleware} from './locale'
import {NunjucksMiddleware} from './nunjucks'
import {Middleware} from './middleware'
import {AssetMiddleware} from './asset'
import {buildSessionMiddleware} from './session'
import {RequestMiddleware} from './requestMiddleware'
import {Express} from 'express'
import {getLogger} from '../utils/logger'

const logger = getLogger('middleware')

export const applyAll = (app: Express) => {
	logger.debug(`Registering ${middleware.length} middleware`)
	middleware.forEach(m => {
		m.applyMiddleware(app)
	})
}

export const middleware: Middleware[] = [
	new LocaleMiddleware(),
	new NunjucksMiddleware(),
	new AssetMiddleware(),
	buildSessionMiddleware(),
	new RequestMiddleware()
]
