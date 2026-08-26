import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {LearningTagService} from '../../../../src/learning-catalogue/service/learningTagService'
import {LearningTagClient} from '../../../../src/learning-catalogue/client/learningTagClient'
import {LearningTagCacheManager} from '../../../../src/csl-service/model/learning/learningTag/learningTagCacheManager'
import {SearchQuery} from '../../../../src/controllers/models/searchQuery'
import {LearningTagHyperlinksResponse} from '../../../../src/learning-catalogue/model/learningTag/learningTagHyperlinksResponse'

chai.use(sinonChai)

describe('LearningTagService tests', () => {
	let cacheManager: sinon.SinonStubbedInstance<LearningTagCacheManager>
	let client: sinon.SinonStubbedInstance<LearningTagClient>
	let service: LearningTagService

	beforeEach(() => {
		cacheManager = sinon.createStubInstance(LearningTagCacheManager)
		client = sinon.createStubInstance(LearningTagClient)
		service = new LearningTagService(cacheManager as any, client as any)
	})

	it('should get hyperlinks page from client', async () => {
		const expectedResponse = new LearningTagHyperlinksResponse()
		const query = new SearchQuery()
		query.p = 0

		client.getTaggedHyperlinks.withArgs(1, query).resolves(expectedResponse)

		const result = await service.getHyperlinksPage(1, query)

		expect(client.getTaggedHyperlinks).to.have.been.calledOnceWith(1, query)
		expect(result).to.eql(expectedResponse)
	})
})
