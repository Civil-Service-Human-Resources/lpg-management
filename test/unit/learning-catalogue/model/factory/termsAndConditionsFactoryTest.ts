import {beforeEach, describe} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {TermsAndConditionsFactory} from '../../../../../src/learning-catalogue/model/factory/termsAndConditionsFactory'
import {TermsAndConditions} from '../../../../../src/learning-catalogue/model/termsAndConditions'
import {expect} from 'chai'

chai.use(sinonChai)

describe('termsAndConditionsFactory tests', () => {
	let termsAndConditionsFactory: TermsAndConditionsFactory

	beforeEach(() => {
		termsAndConditionsFactory = new TermsAndConditionsFactory()
	})

	it('should create a new Terms and Conditions from data', () => {
		const id: string = 'L1U3cK3GQtuf3iDg71NqJw'
		const name: string = 'Example terms and conditions'
		const content = 'This is the content of the terms and conditions.'

		const data: object = {
			id: id,
			name: name,
			content: content,
		}

		const result: TermsAndConditions = termsAndConditionsFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.name).to.equal(name)
		expect(result.content).to.equal(content)
	})
})
