import {beforeEach, describe} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {CancellationPolicy} from '../../../../../src/learning-catalogue/model/cancellationPolicy'
import {expect} from 'chai'
import {LearningProviderFactory} from '../../../../../src/learning-catalogue/model/factory/learningProviderFactory'
import {TermsAndConditions} from '../../../../../src/learning-catalogue/model/termsAndConditions'
import {LearningProvider} from '../../../../../src/learning-catalogue/model/learningProvider'

chai.use(sinonChai)

describe('Learning Provider Factory tests', () => {
	let learningProviderFactory: LearningProviderFactory

	beforeEach(() => {
		learningProviderFactory = new LearningProviderFactory()
	})

	it('should create a a Cancellation Policy from data', () => {
		const id: string = 'L1U3cK3GQtuf3iDg71NqJw'
		const name: string = 'Example cancellation polciy'
		const cancellationPolicies: CancellationPolicy[] = [new CancellationPolicy()]
		const termsAndConditions: TermsAndConditions[] = [new TermsAndConditions(), new TermsAndConditions()]

		const data: object = {
			id: id,
			name: name,
			cancellationPolicies: cancellationPolicies,
			termsAndConditions: termsAndConditions,
		}

		const result: LearningProvider = learningProviderFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.name).to.equal(name)
		expect(result.cancellationPolicies).to.equal(cancellationPolicies)
		expect(result.cancellationPolicies.length).to.equal(1)
		expect(result.termsAndConditions).to.equal(termsAndConditions)
		expect(result.termsAndConditions.length).to.equal(2)
	})
})
