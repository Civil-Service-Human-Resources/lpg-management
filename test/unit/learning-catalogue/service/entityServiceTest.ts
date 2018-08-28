import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {Factory} from '../../../../src/learning-catalogue/model/factory/factory'
import {EntityService} from '../../../../src/learning-catalogue/service/entityService'
import {LearningProvider} from '../../../../src/learning-catalogue/model/learningProvider'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('EntityService tests', () => {
	let restService: RestService
	let learningProviderFactory: Factory<LearningProvider>
	let entityService: EntityService<LearningProvider>

	beforeEach(() => {
		restService = <RestService>{}
		learningProviderFactory = <Factory<LearningProvider>>{}
		entityService = new EntityService<LearningProvider>(restService, learningProviderFactory)
	})

	it('should return paged list of learning providers', async () => {
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

		const page = 0
		const size = 10
		const result = await entityService.listAll(`/learning-providers?page=${page}&size=${size}`)

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

		await entityService.listAll(`/learning-providers?page=${page}&size=${size}`)

		return expect(restService.get).to.have.been.calledOnceWith(`/learning-providers?page=2&size=99`)
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

		const page: number = 0
		const size: number = 10
		await entityService.listAll(`/learning-providers?page=${page}&size=${size}`)

		expect(learningProviderFactory.create).to.not.have.been.called
		expect(data.results).to.eql([])
		expect(data.page).to.eql(0)
		expect(data.size).to.eql(10)
		expect(data.totalResults).to.eql(32)
	})

	it('should call RestService to read a learning provider', async () => {
		const learningProviderId = 'test-id'
		const data = {
			id: learningProviderId,
			name: 'Test LP Title',
		}

		const learningProvider = <LearningProvider>{
			id: data.id,
			name: data.name,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/learning-providers/${learningProviderId}`)
			.returns(data)

		learningProviderFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(learningProvider)

		const result: LearningProvider = await entityService.get(`/learning-providers/${learningProviderId}`)

		expect(result).to.equal(learningProvider)
		expect(restService.get).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}`)
		expect(learningProviderFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should post learning provider and return result of get', async () => {
		const path = `/learning-providers/`
		const learningProviderId = 'test-id'

		const data = {
			id: learningProviderId,
			name: 'Test LP Title',
		}

		const learningProvider = <LearningProvider>{
			id: data.id,
			name: data.name,
		}
		restService.post = sinon
			.stub()
			.withArgs(path, learningProvider)
			.returns(data)

		learningProviderFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(learningProvider)

		const result: LearningProvider = await entityService.create(`/learning-providers/`, learningProvider)

		expect(result).to.equal(learningProvider)

		expect(restService.post).to.have.been.calledOnceWith(path, learningProvider)
		expect(learningProviderFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should put learning provider and return updated learning provider', async () => {
		const path = `/learning-providers/`
		const learningProviderId = 'test-id'

		const data = {
			id: learningProviderId,
			name: 'Test LP Title',
		}

		const learningProvider = <LearningProvider>{
			id: data.id,
			name: data.name,
		}

		restService.put = sinon
			.stub()
			.withArgs(path, learningProvider)
			.returns(data)

		learningProviderFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(learningProvider)

		const result: LearningProvider = await entityService.update(`/learning-providers/`, learningProvider)

		expect(result).to.equal(learningProvider)

		expect(restService.put).to.have.been.calledOnceWith(path, learningProvider)
		expect(learningProviderFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should delete learning provider and return void', async () => {
		const path = `/learning-providers/learning-provider-id`

		restService.delete = sinon.stub()

		await entityService.delete(path)

		expect(restService.delete).to.have.been.calledOnceWith(path)
	})
})
