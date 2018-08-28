import {beforeEach, describe, it} from 'mocha'
import {expect} from 'chai'
import {Module} from '../../../../src/learning-catalogue/model/module'
import {Audience} from '../../../../src/learning-catalogue/model/audience'

describe('Course tests', () => {
	let module: Module

	beforeEach(() => {
		module = new Module()
	})

	it('should be able to set id', () => {
		module.id = 'test-id'
		expect(module.id).to.equal('test-id')
	})

	it('should be able to set type', () => {
		module.type = 'link'
		expect(module.type).to.equal('link')
	})

	it('should be able to set title', () => {
		module.title = 'test-title'
		expect(module.title).to.equal('test-title')
	})

	it('should be able to set description', () => {
		module.description = 'test-description'
		expect(module.description).to.equal('test-description')
	})

	it('should be able to set duration', () => {
		module.duration = 999
		expect(module.duration).to.equal(999)
	})

	it('should be able to set price', () => {
		module.price = 1000
		expect(module.price).to.equal(1000)
	})

	it('should be able to set audience', () => {
		const audiences: Audience[] = [new Audience()]
		module.audiences = audiences
		expect(module.audiences).to.equal(audiences)
	})
})
