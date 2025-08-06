import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'

export const COURSE_COMPLETIONS_FEEDBACK = {
	MESSAGE: process.env.COURSE_COMPLETIONS_FEEDBACK_MESSAGE || "",
	URL: process.env.COURSE_COMPLETIONS_FEEDBACK_URL || "#"
}

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

function getBoolean(rawValue: string) {
	return rawValue !== undefined ? rawValue === 'true' : false
}

const env: Record<string, string> = new Proxy({}, {get: getEnv})

export const HEALTH_CHECK = set({
	enabled: getBoolean(env.HEALTH_CHECK_ENABLED) || true,
	endpoint: env.HEALTH_CHECK_ENDPOINT || undefined
})

export const APPLICATIONINSIGHTS_CONNECTION_STRING = env.APPLICATIONINSIGHTS_CONNECTION_STRING

export const CONTENT_URL = env.CONTENT_URL || 'http://cdn.local.learn.civilservice.gov.uk/lpgdevcontent'

export const CONTENT_CONTAINER = env.CONTENT_CONTAINER || 'lpgdevcontent'

export type validLogLevel = 'trace' | 'debug' | 'info'

export const LOGGING_LEVEL: validLogLevel = env.LOGGING_LEVEL as validLogLevel

export const FRONTEND = set({
	LPG_UI_URL: env.LPG_UI_URL || 'http://localhost:3001',
	MANAGEMENT_UI_URL: env.MANAGEMENT_UI_URL || 'http://localhost:3005',
})

export const AUTHENTICATION = set({
	clientId: env.OAUTH_CLIENT_ID || 'a5881544-6159-4d2f-9b51-8c47ce97454d',
	clientSecret: env.OAUTH_CLIENT_SECRET || 'test',
	authenticationServiceUrl: env.AUTHENTICATION_SERVICE_URL || 'http://localhost:8080',
	callbackUrl: env.CALLBACK_URL || 'http://localhost:3005',
	timeout: Number(env.AUTHENTICATION_SERVICE_TIMEOUT_MS),
	endpoints: set({
		token: env.OAUTH_TOKEN_ENDPOINT || '/oauth2/token',
		authorization: env.OAUTH_AUTHORIZATION_ENDPOINT || '/oauth2/authorize',
		logout: env.AUTHENTICATION_SERVICE_LOGOUT_ENDPOINT || '/logout',
	}),
})

export const REDIS = set({
	host: env.REDIS_HOST || 'localhost',
	keyPrefix: env.REDIS_KEY_PREFIX || 'csl_frontend_',
	password: env.REDIS_PASSWORD || '',
	port: +(env.REDIS_PORT || '6379'),
})

export const ORG_REDIS = set({
	ttl_seconds: +(env.ORG_REDIS_TTL_SECONDS || '604800')
})

export const PROFILE_REDIS = set({
	ttl_seconds: +(env.PROFILE_REDIS_TTL || '604800'),
})

export const REQUEST_TIMEOUT_MS = Number(env.REQUEST_TIMEOUT_MS)

export const AUTHENTICATION_PATH = '/authenticate'

export const YOUTUBE = set({
	api_key: env.YOUTUBE_API_KEY,
	timeout: Number(env.YOUTUBE_TIMEOUT_MS)
})

export const COURSE_CATALOGUE = set({
	url: env.COURSE_CATALOGUE_URL || 'http://localhost:9001',
	timeout: Number(env.COURSE_CATALOGUE_TIMEOUT_MS),
	detailedLogs: getBoolean(env.COURSE_CATALOGUE_DETAILED_LOGS)
})

export const HTTP_SETTINGS = set({
	globalEnableDetailLogs: getBoolean(env.GLOBAL_ENABLE_DETAILED_HTTP_LOGS),
	requestLogging: getBoolean(env.REQUEST_LOGGING)
})

export const LEARNER_RECORD = set({
	url: env.LEARNER_RECORD_URL || 'http://localhost:9000',
	timeout: Number(env.LEARNER_RECORD_TIMEOUT_MS)
})

export const CSL_SERVICE = set({
	url: env.CSL_SERVICE_URL || 'http://localhost:9003',
	timeout: Number(env.CSL_SERVICE_TIMEOUT_MS),
	detailedLogs: getBoolean(env.CSL_SERVICE_DETAILED_LOGS)
})

export const REGISTRY_SERVICE = set({
	url: env.REGISTRY_SERVICE_URL || 'http://localhost:9002',
	timeout: Number(env.REGISTRY_SERVICE_TIMEOUT_MS)
})

export const REPORT_SERVICE = set({
	detailedLogs: getBoolean(env.REPORT_SERVICE_DETAILED_LOGS),
	url: env.REPORT_SERVICE_URL || 'http://localhost:9004',
	timeout: Number(env.REPORT_SERVICE_TIMEOUT_MS),
	MODULE_RECORD_REPORT_ENABLED: getBoolean(env.MODULE_RECORD_REPORT_ENABLED)
})

export const CACHE = {
	TTL_SECONDS: 3600,
	CHECK_PERIOD_SECONDS: 600,
}

export const REPORTING = {
	COURSE_COMPLETIONS_MAX_ORGANISATIONS: Number(env.REPORTING_COURSE_COMPLETIONS_MAX_ORGANISATIONS || 15),
	COURSE_COMPLETIONS_MAX_COURSES: Number(env.REPORTING_COURSE_COMPLETIONS_MAX_COURSES || 10)
}

export const SERVER_TIMEOUT_MS = Number(env.SERVER_TIMEOUT_MS) || 240000
// Azure's servers are all in UTC, so to ensure parity between dev environment and cloud, set the server TZ to UTC
export const SERVER_DEFAULT_TZ = env.SERVER_DEFAULT_TZ || 'UTC'
