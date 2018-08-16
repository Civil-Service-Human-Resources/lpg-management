import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {TermsAndConditionsFactory} from '../../../../src/learning-catalogue/model/factory/termsAndConditionsFactory'
import {TermsAndConditionsService} from '../../../../src/learning-catalogue/service/termsAndConditionsService'
import {TermsAndConditions} from '../../../../src/learning-catalogue/model/termsAndConditions'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('TermsAndConditionsService tests', () => {
	let restService: RestService
	let termsAndConditionsFactory: TermsAndConditionsFactory
	let termsAndConditionsService: TermsAndConditionsService

	beforeEach(() => {
		restService = <RestService>{}
		termsAndConditionsFactory = <TermsAndConditionsFactory>{}
		termsAndConditionsService = new TermsAndConditionsService(restService)
		termsAndConditionsService.termsAndConditionsFactory = termsAndConditionsFactory
	})

	it('should call RestService to get a termsAndConditions', async () => {
		const learningProviderId = 'test-lp-id'
		const termsAndConditionsId = 'test-cp-id'

		const data = {
			id: termsAndConditionsId,
			name: 'Test cancellation policy name',
			content: 'Test cancellation policy short version',
		}

		const termsAndConditions = <TermsAndConditions>{
			id: data.id,
			name: data.name,
			content: data.content,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`)
			.returns(data)

		termsAndConditionsFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(termsAndConditions)

		const result: TermsAndConditions = await termsAndConditionsService.get(learningProviderId, termsAndConditionsId)

		expect(result).to.equal(termsAndConditions)
		expect(restService.get).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`
		)
		expect(termsAndConditionsFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should post termsAndConditions and return result of get', async () => {
		const learningProviderId = 'test-lp-id'
		const termsAndConditionsId = 'test-cp-id'

		const path = `/learning-providers/${learningProviderId}/terms-and-conditions`

		const data = {
			id: termsAndConditionsId,
			name: 'Test cancellation policy name',
			content: 'Test cancellation policy short version',
		}

		const termsAndConditions = <TermsAndConditions>{
			id: data.id,
			name: data.name,
			content: data.content,
		}

		restService.post = sinon
			.stub()
			.withArgs(path, termsAndConditions)
			.returns(data)

		termsAndConditionsFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(termsAndConditions)

		const result: TermsAndConditions = await termsAndConditionsService.create(
			learningProviderId,
			termsAndConditions
		)

		expect(result).to.equal(termsAndConditions)
		expect(restService.post).to.have.been.calledOnceWith(path, termsAndConditions)
		expect(termsAndConditionsFactory.create).to.have.been.calledOnceWith(data)
	})
})
