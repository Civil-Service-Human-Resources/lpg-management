import {describe} from 'mocha'
import {expect} from 'chai'
import {CacheService} from '../../../src/lib/cacheService'

describe('CacheService', () => {
	let cacheService: CacheService

	before(() => {
		cacheService = new CacheService()
	})

	it('should return undefined when key not found', () => {
		const value = cacheService.cache.get('some key we are not expecting')
		expect(value).to.be.undefined
	})

	it('should return value when key found', () => {
		const key = 'some key'
		const value = 'some value'

		cacheService.cache.set(key, value)
		const cachedValue = cacheService.cache.get(key)

		expect(cachedValue).to.be.equal(value)
	})
})
