import {Middleware} from './middleware'
import {Express} from 'express'
import * as bodyParser from 'body-parser'
const fileUpload = require('express-fileupload')

export class RequestMiddleware extends Middleware {
	apply(app: Express): void {
		app.use(fileUpload())

		app.use(bodyParser.json())
		app.use(bodyParser.urlencoded({extended: false}))
	}

	getName(): string {
		return 'RequestMiddleware'
	}

}
