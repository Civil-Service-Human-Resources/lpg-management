import {Middleware} from './middleware'
import {Express} from 'express'
import * as session from 'express-session'
import {AppConfig} from '../config/appConfig'
import {RedisStore} from 'connect-redis'
import * as cookieParser from 'cookie-parser'
import * as connectRedis from 'connect-redis'
import * as redis from 'redis'
import * as config from '../config'

export class SessionMiddleware extends Middleware {
    apply(app: Express): void {
		app.use(cookieParser())
		app.use(
			session({
				cookie: this.appConfig.cookie,
				name: this.appConfig.name,
				resave: this.appConfig.resave,
				saveUninitialized: this.appConfig.saveUninitialized,
				secret: this.appConfig.secret,
				store: this.store,
			})
		)
    }
    getName(): string {
        return 'SessionMiddleware'
    }

	constructor(private appConfig: AppConfig, private store: RedisStore) {super()}

}

export const buildSessionMiddleware = () => {
	const appConfig = new AppConfig()
	const RedisStore = connectRedis(session)
	const redisClient = redis.createClient({
		auth_pass: config.REDIS.password,
		host: config.REDIS.host,
		no_ready_check: true,
		port: config.REDIS.port,
	})
	const redisStore = new RedisStore({
		client: redisClient,
	})
	return new SessionMiddleware(appConfig, redisStore)
}
