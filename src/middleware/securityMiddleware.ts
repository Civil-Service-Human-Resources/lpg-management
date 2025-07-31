import {Middleware} from './middleware'
import {Express} from 'express'
import * as lusca from 'lusca'
export class SecurityMiddleware extends Middleware {
	apply(app: Express): void {
		app.use(lusca({
			csrf: true,
			xssProtection: true,
			nosniff: true
		}))
	}

	getName(): string {
		return 'SecurityMiddleware'
	}

}
