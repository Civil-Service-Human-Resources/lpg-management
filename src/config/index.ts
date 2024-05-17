import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'

export const ENV = process.env.NODE_ENV || 'development'

if (ENV === 'development') {
	console.log('Development environment detected, loading .env')
	dotenv.load({
		path: path.resolve(__dirname + '/.env')
	})
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

export const APPLICATIONINSIGHTS_CONNECTION_STRING = env.APPLICATIONINSIGHTS_CONNECTION_STRING

export const CONTENT_URL = env.CONTENT_URL || 'http://cdn.local.learn.civilservice.gov.uk/lpgdevcontent'

export const CONTENT_CONTAINER = env.CONTENT_CONTAINER || 'lpgdevcontent'

export const LOGGING_LEVEL = env.LOGGING_LEVEL

export const AUTHENTICATION = set({
	clientId: env.OAUTH_CLIENT_ID || 'a5881544-6159-4d2f-9b51-8c47ce97454d',
	clientSecret: env.OAUTH_CLIENT_SECRET || 'test',
	authenticationServiceUrl: env.AUTHENTICATION_SERVICE_URL || 'http://localhost:8080',
	callbackUrl: env.CALLBACK_URL || 'http://localhost:3005',
	timeout: Number(env.AUTHENTICATION_SERVICE_TIMEOUT_MS),
	endpoints: set({
		token: env.OAUTH_TOKEN_ENDPOINT || '/oauth/token',
		authorization: env.OAUTH_AUTHORIZATION_ENDPOINT || '/oauth/authorize',
		resolve: env.AUTHENTICATION_SERVICE_RESOLVE_ENDPOINT || '/oauth/resolve',
		logout: env.AUTHENTICATION_SERVICE_LOGOUT_ENDPOINT || '/oauth/logout',
	}),
})

export const REDIS = set({
	host: env.REDIS_HOST || 'localhost',
	password: env.REDIS_PASSWORD || '',
	port: +(env.REDIS_PORT || '6379'),
})

export const ORG_REDIS = set({
	host: env.ORG_REDIS_HOST || 'localhost',
	password: env.ORG_REDIS_PASSWORD || '',
	port: +(env.ORG_REDIS_PORT || '6379'),
	ttl_seconds: +(env.ORG_REDIS_TTL_SECONDS || '604800')
})

export const REQUEST_TIMEOUT_MS = Number(env.REQUEST_TIMEOUT_MS)

export const AUTHENTICATION_PATH = '/authenticate'

export const YOUTUBE = set({
	api_key: env.YOUTUBE_API_KEY,
	timeout: Number(env.YOUTUBE_TIMEOUT_MS)
})

export const COURSE_CATALOGUE = set({
	url: env.COURSE_CATALOGUE_URL || 'http://localhost:9001',
	timeout: Number(env.COURSE_CATALOGUE_TIMEOUT_MS)
})

export const HTTP_SETTINGS = set({
	globalEnableDetailLogs: Boolean(env.GLOBAL_ENABLE_DETAILED_HTTP_LOGS || false),
	requestLogging: Boolean(env.REQUEST_LOGGING || false)
})

export const LEARNER_RECORD = set({
	url: env.LEARNER_RECORD_URL || 'http://localhost:9000',
	timeout: Number(env.LEARNER_RECORD_TIMEOUT_MS)
})

export const CSL_SERVICE = set({
	url: env.CSL_SERVICE_URL || 'http://localhost:9003',
	timeout: Number(env.CSL_SERVICE_TIMEOUT_MS),
	detailedLogs: Boolean(env.CSL_SERVICE_DETAILED_LOGS || false)
})

export const REGISTRY_SERVICE = set({
	url: env.REGISTRY_SERVICE_URL || 'http://localhost:9002',
	timeout: Number(env.REGISTRY_SERVICE_TIMEOUT_MS)
})

export const REPORT_SERVICE = set({
	detailedLogs: Boolean(env.REPORT_SERVICE_DETAILED_LOGS) || false,
	url: env.REPORT_SERVICE_URL || 'http://localhost:9004',
	timeout: Number(env.REPORT_SERVICE_TIMEOUT_MS)
})

export const CACHE = {
	TTL_SECONDS: 3600,
	CHECK_PERIOD_SECONDS: 600,
}

export const REPORTING = {
	COURSE_COMPLETIONS_MAX_COURSES: Number(env.REPORTING_COURSE_COMPLETIONS_MAX_COURSES || 10)
}

export const SERVER_TIMEOUT_MS = Number(env.SERVER_TIMEOUT_MS) || 240000
