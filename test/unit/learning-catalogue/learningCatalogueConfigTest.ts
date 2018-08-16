import {beforeEach, describe, it} from 'mocha'
import {expect} from 'chai'
import {LearningCatalogueConfig} from '../../../src/learning-catalogue/learningCatalogueConfig'

describe('LearningCatalogueConfig tests', () => {
	let config: LearningCatalogueConfig

	beforeEach(() => {
		config = new LearningCatalogueConfig({username: 'username', password: 'password'}, 'url', 120)
	})

	it('should set properties in constructor', () => {
		expect(config.auth.username).to.equal('username')
		expect(config.auth.password).to.equal('password')
		expect(config.url).to.equal('url')
		expect(config.timeout).to.equal(120)
	})

	it('should be able to change auth', () => {
		const auth = {
			username: 'abc',
			password: 'def',
		}

		config.auth = auth
		expect(config.auth).to.eql(auth)
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
		const config = new LearningCatalogueConfig({username: 'username', password: 'password'}, 'url')
		expect(config.timeout).to.equal(15000)
	})
})
