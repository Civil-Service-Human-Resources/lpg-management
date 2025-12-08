import * as NodeCache from 'node-cache'

export class CacheService {
	private readonly _cache: NodeCache

	constructor(parameters?: any) {
		this._cache = new NodeCache(parameters)
	}

	get cache(): NodeCache {
		return this._cache
	}
}
