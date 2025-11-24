import {CacheableObjectCache} from '../lib/cache/cacheableObjectCache'
import {Profile} from './model/profile'
import {RedisClient} from 'redis'

export class ProfileCache extends CacheableObjectCache<Profile> {
	constructor(redisClient: RedisClient, defaultTTL: number) {
		super(redisClient, defaultTTL, 'civilServants', Profile)
	}
}
