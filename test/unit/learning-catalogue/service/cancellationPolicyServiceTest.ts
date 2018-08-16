import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {CancellationPolicyFactory} from '../../../../src/learning-catalogue/model/factory/cancellationPolicyFactory'
import {CancellationPolicyService} from '../../../../src/learning-catalogue/service/cancellationPolicyService'
import {CancellationPolicy} from '../../../../src/learning-catalogue/model/cancellationPolicy'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('CancellationPolicyService tests', () => {
	let restService: RestService
	let cancellationPolicyFactory: CancellationPolicyFactory
	let cancellationPolicyService: CancellationPolicyService

	beforeEach(() => {
		restService = <RestService>{}
		cancellationPolicyFactory = <CancellationPolicyFactory>{}
		cancellationPolicyService = new CancellationPolicyService(restService)
		cancellationPolicyService.cancellationPolicyFactory = cancellationPolicyFactory
	})

	it('should call RestService to get a cancellationPolicy', async () => {
		const learningProviderId = 'test-lp-id'
		const cancellationPolicyId = 'test-cp-id'

		const data = {
			id: cancellationPolicyId,
			name: 'Test cancellation policy name',
			shortVersion: 'Test cancellation policy short version',
		}

		const cancellationPolicy = <CancellationPolicy>{
			id: data.id,
			name: data.name,
			shortVersion: data.shortVersion,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`)
			.returns(data)

		cancellationPolicyFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(cancellationPolicy)

		const result: CancellationPolicy = await cancellationPolicyService.get(learningProviderId, cancellationPolicyId)

		expect(result).to.equal(cancellationPolicy)
		expect(restService.get).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`
		)
		expect(cancellationPolicyFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should post cancellationPolicy and return result of get', async () => {
		const learningProviderId = 'test-lp-id'
		const cancellationPolicyId = 'test-cp-id'

		const path = `/learning-providers/${learningProviderId}/cancellation-policies`

		const data = {
			id: cancellationPolicyId,
			name: 'Test cancellation policy name',
			shortVersion: 'Test cancellation policy short version',
		}

		const cancellationPolicy = <CancellationPolicy>{
			id: data.id,
			name: data.name,
			shortVersion: data.shortVersion,
		}

		restService.post = sinon
			.stub()
			.withArgs(path, cancellationPolicy)
			.returns(data)

		cancellationPolicyFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(cancellationPolicy)

		const result: CancellationPolicy = await cancellationPolicyService.create(
			learningProviderId,
			cancellationPolicy
		)

		expect(result).to.equal(cancellationPolicy)
		expect(restService.post).to.have.been.calledOnceWith(path, cancellationPolicy)
		expect(cancellationPolicyFactory.create).to.have.been.calledOnceWith(data)
	})
})
