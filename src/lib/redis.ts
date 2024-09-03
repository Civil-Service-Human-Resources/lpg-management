import * as redis from 'redis'
import * as config from '../config'

export const client = createRedisClient()

function createRedisClient() {
	return redis.createClient({
		auth_pass: config.REDIS.password,
		host: config.REDIS.host,
		prefix: config.REDIS.keyPrefix,
		no_ready_check: true,
		port: config.REDIS.port
	})
}
