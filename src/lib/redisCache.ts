
import { Multi, RedisClient } from 'redis'
import { promisify } from 'util'
import { Logger } from 'winston'
import { getLogger } from '../utils/logger'
import * as config from '../config/index'

export abstract class Cache<T> {
	protected logger: Logger
	constructor(protected readonly redisClient: RedisClient, protected readonly defaultTTL: number) {
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
			await promisify(this.redisClient.setex).bind(this.redisClient)(
				key,
				ttlOverride ? ttlOverride : this.defaultTTL,
				JSON.stringify(object)
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

	async deleteAllIds(){
		const ids = await this.getAllIds()
		await this.deleteMultiple(ids)
	}

	async deleteMultiple(ids: string[]){		
		const pipeline: Multi = this.redisClient.multi()

		const pipelineExpirePromises = ids.map(id => promisify(pipeline.expire).bind(pipeline)(this.getFormattedKey(id), 0))
		Promise.all(pipelineExpirePromises)

		await promisify(pipeline.exec).bind(pipeline)()		
	}

	async getAllIds(): Promise<string[]> {
		const keyPrefix: string = config.REDIS.keyPrefix
		// redisClient.scan doesn't respect the configured keyPrefix
		// so we need to add it to the MATCH pattern ourselves and then strip it from the results

		const keyWithPrefix: string = `${keyPrefix}${this.getBaseKey()}`

		const scanResults = await promisify(this.redisClient.scan).bind(this.redisClient)(0, 'MATCH', `${keyWithPrefix}*`, 'COUNT', '1000000')
		
		const ids: string[] = scanResults[1]
			.map((key: string) => key.replace(new RegExp(`^${keyWithPrefix}:`),  ''))			
		
		return ids
	}

	protected getFormattedKey(keyPart: string | number) {
		return `${this.getBaseKey()}:${keyPart}`
	}

	protected abstract getBaseKey(): string
	protected abstract convert(cacheHit: any): T
}
