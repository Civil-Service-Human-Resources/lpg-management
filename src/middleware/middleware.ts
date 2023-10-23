import {Express} from 'express'
import {getLogger} from '../utils/logger'

export abstract class Middleware {
	protected logger = getLogger('middleware')
	applyMiddleware(app: Express) {
		this.logger.debug(`Applying middleware '${this.getName()}'`)
		this.apply(app)
	}
	abstract apply(app: Express): void
	abstract getName(): string
}
