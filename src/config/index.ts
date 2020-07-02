import * as fs from 'fs'
import * as dotenv from 'dotenv'

export const ENV = process.env.NODE_ENV || 'development'

if (ENV === 'development') {
	const envFile = '/keybase/team/lpg/dev/dotenv'
	try {
		if (!fs.statSync(envFile).isFile()) {
			throw new Error(`File not found: ${envFile}`)
		}
		dotenv.config({path: envFile})
	} catch (err) {
		console.error(`!!! Unable to load the env file at ${envFile} !!!`)
	}
}

function getEnv(obj: any, attr: string) {
	return process.env[attr] || ''
}

function set<T>(defaultValue: T, envValues: Record<string, T> = {}): T {
	const val = envValues[ENV]
	if (val === undefined) {
		return defaultValue
	}
	return val
}

const env: Record<string, string> = new Proxy({}, {get: getEnv})

export const CONTENT_URL = env.CONTENT_URL || 'http://local-cdn.cshr.digital/lpgdevcontent'

export const CONTENT_CONTAINER = env.CONTENT_CONTAINER || 'lpgdevcontent'

export const LOGGING = set(
	{
		appenders: {
			out: {type: 'console'},
		},
		categories: {
			default: {appenders: ['out'], level: 'info'},
		},
	},
	{
		development: {
			appenders: {
				out: {type: 'console'},
			},
			categories: {
				default: {appenders: ['out'], level: 'debug'},
			},
		},
	}
)

export const AUTHENTICATION = set({
	clientId: env.OAUTH_CLIENT_ID || 'a5881544-6159-4d2f-9b51-8c47ce97454d',
	clientSecret: env.OAUTH_CLIENT_SECRET || 'test',
	authenticationServiceUrl: env.AUTHENTICATION_SERVICE_URL || 'http://localhost:8080',
	callbackUrl: env.CALLBACK_URL || 'http://localhost:3005',
})

export const REQUEST_TIMEOUT = Number(env.REQUEST_TIMEOUT) || 15000

export const AUTHENTICATION_PATH = '/authenticate'

export const YOUTUBE_API_KEY = env.YOUTUBE_API_KEY

export const COURSE_CATALOGUE = set({
	url: env.COURSE_CATALOGUE_URL || 'http://localhost:9001',
})

export const LEARNER_RECORD = set({
	url: env.LEARNER_RECORD_URL || 'http://localhost:9000',
})

export const REGISTRY_SERVICE_URL = set({
	url: env.REGISTRY_SERVICE_URL || 'http://localhost:9002',
})

export const REPORT_SERVICE = set({
	url: env.REPORT_SERVICE_URL || 'http://localhost:9004',
	map: {
		'booking-information': '/bookings',
	},
})

export const CACHE = {
	TTL_SECONDS: 3600,
	CHECK_PERIOD_SECONDS: 600,
}

export const INSTRUMENTATION_KEY = env.instrumentation_key || 'instrumentation_key'
