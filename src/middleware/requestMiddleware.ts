import {Middleware} from './middleware'
import * as express from 'express'
export class RequestMiddleware extends Middleware {
	apply(app: express.Express): void {
		app.use(express.json())
		app.use(express.urlencoded({extended: false}))
	}

	getName(): string {
		return 'RequestMiddleware'
	}

}
