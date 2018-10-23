import {beforeEach, describe, it} from 'mocha'
import {expect} from 'chai'
import {LearningCatalogueConfig} from '../../../src/learning-catalogue/learningCatalogueConfig'

describe('LearningCatalogueConfig tests', () => {
	let config: LearningCatalogueConfig

	beforeEach(() => {
		config = new LearningCatalogueConfig('url', 120)
	})

	it('should set properties in constructor', () => {
		expect(config.url).to.equal('url')
		expect(config.timeout).to.equal(120)
	})

	it('should be able to change url', () => {
		config.url = 'abc'
		expect(config.url).to.equal('abc')
	})

	it('should be able to change timeout', () => {
		config.timeout = 60
		expect(config.timeout).to.equal(60)
	})

	it('should have default timeout of 15000', () => {
		const config = new LearningCatalogueConfig('url')
		expect(config.timeout).to.equal(15000)
	})
})
