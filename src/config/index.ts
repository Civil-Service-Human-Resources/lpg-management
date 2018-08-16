export const ENV = process.env.NODE_ENV || 'development'

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
	authenticationServiceUrl: env.AUTHENTICATION_SERVICE_URL || 'http://identity.local.cshr.digital:8080',
	callbackUrl: env.CALLBACK_URL || 'http://lpg.local.cshr.digital:3005',
})

export const REQUEST_TIMEOUT = Number(env.REQUEST_TIMEOUT) || 15000

export const AUTHENTICATION_PATH = '/authenticate'

export const COURSE_CATALOGUE = set({
	auth: {
		password: env.COURSE_CATALOGUE_PASS || 'password',
		username: env.COURSE_CATALOGUE_USER || 'user',
	},
	url: env.COURSE_CATALOGUE_URL || 'http://localhost:9001',
})
