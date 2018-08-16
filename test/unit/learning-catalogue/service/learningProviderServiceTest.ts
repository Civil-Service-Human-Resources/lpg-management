import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {LearningProviderFactory} from '../../../../src/learning-catalogue/model/factory/learningProviderFactory'
import {LearningProviderService} from '../../../../src/learning-catalogue/service/learningProviderService'
import {LearningProvider} from '../../../../src/learning-catalogue/model/learningProvider'
import {CancellationPolicy} from '../../../../src/learning-catalogue/model/cancellationPolicy'
import {TermsAndConditions} from '../../../../src/learning-catalogue/model/termsAndConditions'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('LearningProviderService tests', () => {
	let restService: RestService
	let learningProviderFactory: LearningProviderFactory
	let learningProviderService: LearningProviderService

	beforeEach(() => {
		restService = <RestService>{}
		learningProviderFactory = <LearningProviderFactory>{}
		learningProviderService = new LearningProviderService(restService)
		learningProviderService.learningProviderFactory = learningProviderFactory
	})

	it('should convert learning catalogue response to paged list of learning providers', async () => {
		const data = {
			results: [
				{
					id: 'abc',
				},
				{
					id: 'def',
				},
			],
			page: 0,
			totalResults: 32,
			size: 10,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/learning-providers?page=0&size=10`)
			.returns(data)

		const learningProvider1: LearningProvider = new LearningProvider()
		learningProvider1.id = 'abc'

		const learningProvider2: LearningProvider = new LearningProvider()
		learningProvider2.id = 'def'

		const createStub = sinon.stub()
		createStub.withArgs({id: 'abc'}).returns(learningProvider1)
		createStub.withArgs({id: 'def'}).returns(learningProvider2)

		learningProviderFactory.create = createStub

		const result = await learningProviderService.listAll()

		expect(learningProviderFactory.create).to.have.been.calledTwice
		expect(result.results).to.eql([learningProvider1, learningProvider2])
		expect(result.page).to.eql(0)
		expect(result.size).to.eql(10)
		expect(result.totalResults).to.eql(32)
		expect(restService.get).to.have.been.calledOnceWith(`/learning-providers?page=0&size=10`)
	})

	it('should pass page parameters to http call', async () => {
		const page: number = 2
		const size: number = 99

		const data = {
			results: [],
			page: 0,
			totalResults: 32,
			size: 10,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/learning-providers?page=${page}&size=${size}`)
			.returns(data)

		learningProviderFactory.create = sinon.stub()

		await learningProviderService.listAll(page, size)

		return expect(restService.get).to.have.been.calledOnceWith(`/learning-providers?page=${page}&size=${size}`)
	})

	it('should return empty list of results if results are null', async () => {
		const data = {
			results: null,
			page: 0,
			totalResults: 32,
			size: 10,
		}

		restService.get = sinon
			.stub()
			.returns(data)
			.withArgs('/learning-providers?page=0&size=10')

		learningProviderFactory.create = sinon.stub()

		await learningProviderService.listAll()

		expect(learningProviderFactory.create).to.not.have.been.called
		expect(data.results).to.eql([])
		expect(data.page).to.eql(0)
		expect(data.size).to.eql(10)
		expect(data.totalResults).to.eql(32)
	})

	it('should call RestService to get a learningProvider', async () => {
		const learningProviderId = 'test-lp-id'

		const data = {
			id: learningProviderId,
			name: 'Test learning provider name',
			cancellationPolicies: [new CancellationPolicy()],
			termsAndConditions: [new TermsAndConditions()],
		}

		const learningProvider = <LearningProvider>{
			id: data.id,
			cancellationPolicies: data.cancellationPolicies,
			termsAndConditions: data.termsAndConditions,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/learning-providers/${learningProviderId}`)
			.returns(data)

		learningProviderFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(learningProvider)

		const result: LearningProvider = await learningProviderService.get(learningProviderId)

		expect(result).to.equal(learningProvider)
		expect(restService.get).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}`)
		expect(learningProviderFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should post learningProvider and return result of get', async () => {
		const learningProviderId = 'test-lp-id'

		const path = `/learning-providers/`

		const data = {
			id: learningProviderId,
			name: 'Test learning provider name',
			cancellationPolicies: [new CancellationPolicy()],
			termsAndConditions: [new TermsAndConditions()],
		}

		const learningProvider = <LearningProvider>{
			id: data.id,
			cancellationPolicies: data.cancellationPolicies,
			termsAndConditions: data.termsAndConditions,
		}

		restService.post = sinon
			.stub()
			.withArgs(path, learningProvider)
			.returns(data)

		learningProviderFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(learningProvider)

		const result: LearningProvider = await learningProviderService.create(learningProvider)

		expect(result).to.equal(learningProvider)
		expect(restService.post).to.have.been.calledOnceWith(path, learningProvider)
		expect(learningProviderFactory.create).to.have.been.calledOnceWith(data)
	})
})
