import {Middleware} from './middleware'
import * as express from 'express'
import * as morgan from 'morgan'
import {getLogger} from '../utils/logger'

const logger = getLogger('request')

export class RequestMiddleware extends Middleware {
	apply(app: express.Express): void {
		app.use(express.json())
		app.use(express.urlencoded({extended: false}))

		const getMorgan = (immediate: boolean) => {
			const format = immediate ? 'Initial request: :method :url' : 'Completed request: :method :url response: :status, res content length: :res[content-length], response time: :response-time ms'
			return morgan(format, {
				immediate,
				stream: {
					write: (message) => logger.debug(message.trim())
				}
			})
		}

		app.use([
			getMorgan(true),
			getMorgan(false)
		])
	}

	getName(): string {
		return 'RequestMiddleware'
	}

}
