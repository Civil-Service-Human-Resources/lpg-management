import {Middleware} from './middleware'
import {Express} from 'express'
import * as path from 'path'
const i18n = require('i18n-express')

export class LocaleMiddleware extends Middleware {
	apply(app: Express): void {
		app.use(
			i18n({
				translationsPath: path.join(path.dirname(__dirname), '/locale'),
				siteLangs: ['en'],
				textsVarName: 'i18n',
			})
		)
	}

	getName(): string {
		return 'LocaleMiddleware'
	}

}
