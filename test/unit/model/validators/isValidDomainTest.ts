import {validate} from 'class-validator'
import {expect} from 'chai'
import {IsValidDomain} from '../../../../src/validators/isValidDomain'

class TestClass {
	@IsValidDomain({
		message: 'invalid domain supplied'
	})
	public domain: string

	constructor(domain: string) {
		this.domain = domain
	}
}

describe('isValidDomain tests', () => {
	it('Should raise an error when an incorrect domain is used', () => {
		const testClass= new TestClass("invaliddomain")
		validate(testClass)
			.then(e => {
				expect(e.length).to.equal(1)
				expect(e[0].constraints['isValidDomain']).to.equal('invalid domain supplied')
			})
	})
	it('Should NOT raise an error when a correct domain is used', () => {
		const testClass= new TestClass("valid-domain.com")
		validate(testClass)
			.then(e => {
				expect(e.length).to.equal(0)

			})
	})
})
