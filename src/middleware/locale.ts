import {Middleware} from './middleware'
import {Express} from 'express'
const appRoot = require('app-root-path')
const i18n = require('i18n-express')

export class LocaleMiddleware extends Middleware {
	apply(app: Express): void {
		app.use(
			i18n({
				translationsPath: appRoot + '/src/locale',
				siteLangs: ['en'],
				textsVarName: 'i18n',
			})
		)
	}

	getName(): string {
		return 'LocaleMiddleware'
	}

}
