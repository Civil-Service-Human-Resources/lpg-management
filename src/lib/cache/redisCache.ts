
import { RedisClient } from 'redis'
import { promisify } from 'util'
import { Logger } from 'winston'
import { getLogger } from '../../utils/logger'
import {ClassConstructor, plainToClass} from 'class-transformer'

export class Cache<T> {
	protected logger: Logger
	constructor(protected readonly redisClient: RedisClient, protected readonly defaultTTL: number,
				protected readonly keySpace: string, protected readonly clazz: ClassConstructor<T>,) {
		this.logger = getLogger('Cache')
	}

	async get(id: string | number): Promise<T | undefined> {
		const key = this.getFormattedKey(id)
		this.logger.debug(`Fetching object with cache key ${key}`)
		try {
			const response = await promisify(this.redisClient.get).bind(this.redisClient)(key)
			if (response === null) {
				return undefined
			}
			return this.convert(JSON.parse(response))
		} catch (e) {
			this.logger.error(`Error getting object from cache with key ${key}. Error: ${e}`)
			return undefined
		}
	}

	async set(id: string | number, object: T, ttlOverride?: number) {
		const key = this.getFormattedKey(id)
		try {
			ttlOverride = ttlOverride ? ttlOverride : this.defaultTTL
			const strObject = JSON.stringify(object)
			this.logger.debug(`Setting object ${strObject} to cache key ${key} and ttl ${ttlOverride}`)
			await promisify(this.redisClient.setex).bind(this.redisClient)(
				key,
				ttlOverride,
				strObject
			)
		} catch (e) {
			this.logger.error(`Error setting object to cache with key ${key}. Object: ${JSON.stringify(object)} Error: ${e}.`)
			throw e
		}
	}

	async delete(id: string | number) {
		const key = this.getFormattedKey(id)
		try {
			// redisClient.delete does not play nicely with promisify, so just
			// set expiriy = now
			this.logger.debug(`Deleting object with cache key ${key}`)
			await promisify(this.redisClient.expire).bind(this.redisClient)(key, 0)
		} catch (e) {
			this.logger.error(`Error deleting object from cache with key ${key}. Error: ${e}.`)
			throw e
		}
	}

	async update(id: string | number, fn: (object: T) => void) {
		let object = await this.get(id)
		if (object) {
			fn(object)
			await this.set(id, object)
		}
	}

	protected getFormattedKey(keyPart: string | number) {
		return `${this.keySpace}:${keyPart}`
	}

	protected convert(cacheHit: string): T {
		return plainToClass(this.clazz, cacheHit)
	}

}
