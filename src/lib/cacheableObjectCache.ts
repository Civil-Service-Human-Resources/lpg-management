import {CacheableObject} from '../lib/cacheableObject'
import { Cache } from '../lib/redisCache';

export abstract class CacheableObjectCache <T extends CacheableObject> extends Cache<T> {
	protected abstract convert(cacheHit: any): T

	async setMultiple(objects: T[]) {
		return Promise.all(objects.map(o => this.set(o.getId(), o)))
	}

	protected abstract getBaseKey(): string

}
