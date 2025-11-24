import {CacheableObject} from './cacheableObject'
import { Cache } from './redisCache';

export abstract class CacheableObjectCache <T extends CacheableObject> extends Cache<T> {
	async setObject(object: T, ttlOverride?: number) {
		await this.set(object.getId(), object, ttlOverride)
	}

}
