import {CacheableObject} from '../lib/cacheableObject'
import { Cache } from '../lib/redisCache';

export abstract class CacheableObjectCache <T extends CacheableObject> extends Cache<T> {
	protected abstract convert(cacheHit: any): T

	async setObject(object: T, ttlOverride?: number) {
		await this.set(object.getId(), object, ttlOverride)
	}

	async setMultiple(objects: T[]) {
		this.logger.debug(`Setting ${objects.length} objects with ids [${objects.map(o => o.getId())}] to the '${this.getBaseKey()}' cache`)
		return Promise.all(objects.map(o => this.set(o.getId(), o)))
	}

	protected abstract getBaseKey(): string

}
