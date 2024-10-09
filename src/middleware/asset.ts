const appRoot = require('app-root-path')
import {Middleware} from './middleware'
import {Express} from 'express'

const serveStatic = require('serve-static')

export class AssetMiddleware extends Middleware {

	apply(app: Express): void {
		app.use('/assets', serveStatic(appRoot + '/node_modules/govuk-frontend/govuk/assets'))
		app.use('/js', serveStatic(appRoot + '/views/assets/js'))
		app.use(serveStatic(appRoot + '/views/assets'))
		app.use('/govuk-frontend', serveStatic(appRoot + '/node_modules/govuk-frontend/govuk/'))
		app.use('/sortablejs', serveStatic(appRoot + '/node_modules/sortablejs/'))
	}

	getName(): string {
		return 'AssetMiddleware'
	}
}
