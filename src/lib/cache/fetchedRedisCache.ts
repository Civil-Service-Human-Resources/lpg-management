import {Cache} from '../../lib/cache/redisCache'
import {getLogger} from '../../utils/logger'

export abstract class FetchedRedisCache<T> {

	private logger = getLogger('FetchedRedisCache')

	constructor(private readonly cache: Cache<T>, private readonly objectId: string) { }

	async get(): Promise<T> {
		let result: T | undefined = await this.cache.get(this.objectId)
		if (result === undefined) {
			result = await this.fetchResource()
			await this.cache.set(this.objectId, result)
		}
		return result
	}

	async set(object: T, ttlOverride?: number | undefined) {
		await this.cache.set(this.objectId, object, ttlOverride)
	}

	async update(updateFn: (object: T) => void): Promise<T> {
		try {
			let object = await this.get()
			updateFn(object)
			await this.set(object)
			return object
		} catch (e) {
			this.logger.error(`Error performing update against cached object: ${e}`)
			this.logger.info("Clearing cache due to error")
			await this.delete()
		}
		return this.get()
	}

	async delete() {
		await this.cache.delete(this.objectId)
	}

	abstract fetchResource(): Promise<T>
}
