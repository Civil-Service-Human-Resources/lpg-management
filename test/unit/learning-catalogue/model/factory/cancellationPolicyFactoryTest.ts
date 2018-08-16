import {beforeEach, describe} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {CancellationPolicyFactory} from '../../../../../src/learning-catalogue/model/factory/cancellationPolicyFactory'
import {CancellationPolicy} from '../../../../../src/learning-catalogue/model/cancellationPolicy'
import {expect} from 'chai'

chai.use(sinonChai)

describe('CancellationPolicy tests', () => {
	let cancellationPolicyFactory: CancellationPolicyFactory

	beforeEach(() => {
		cancellationPolicyFactory = new CancellationPolicyFactory()
	})

	it('should create a a Cancellation Policy from data', () => {
		const id: string = 'L1U3cK3GQtuf3iDg71NqJw'
		const name: string = 'Example cancellation polciy'
		const shortVersion = 'This is the short version of the policy.'
		const fullVersion: string = 'This is the full version of the policy'

		const data: object = {
			id: id,
			name: name,
			shortVersion: shortVersion,
			fullVersion: fullVersion,
		}

		const result: CancellationPolicy = cancellationPolicyFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.name).to.equal(name)
		expect(result.shortVersion).to.equal(shortVersion)
		expect(result.fullVersion).to.equal(fullVersion)
	})
})
