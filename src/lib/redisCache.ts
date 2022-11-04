
import { createClient } from 'redis'

export abstract class Cache<T> {
	constructor(protected readonly redisClient: ReturnType<typeof createClient>) {
	}

	async get(id: string|number): Promise<T | undefined> {
		const response = await this.redisClient.get(this.getFormattedKey(id))
		if (response === null) {
			return undefined
		}
		return this.convert(response)
	}

    async set(id: string|number, object: T) {
		await this.redisClient.set(this.getFormattedKey(id), JSON.stringify(object))
    }

	async delete(id: string|number) {
		await this.redisClient.del(this.getFormattedKey(id))
	}

	protected getFormattedKey(keyPart: string|number) {
		return `${this.getBaseKey()}:${keyPart}`
	}

	protected abstract getBaseKey(): string
	protected abstract convert(cacheHit: string): T
}
