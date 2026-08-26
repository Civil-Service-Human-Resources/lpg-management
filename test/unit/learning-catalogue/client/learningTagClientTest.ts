import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {LearningTagClient} from '../../../../src/learning-catalogue/client/learningTagClient'
import {OauthRestService} from '../../../../src/lib/http/oauthRestService'
import {SearchQuery} from '../../../../src/controllers/models/searchQuery'
import {LearningTagHyperlinksResponse} from '../../../../src/learning-catalogue/model/learningTag/learningTagHyperlinksResponse'

chai.use(sinonChai)

describe('LearningTagClient tests', () => {
	let restService: sinon.SinonStubbedInstance<OauthRestService>
	let client: LearningTagClient

	beforeEach(() => {
		restService = sinon.createStubInstance(OauthRestService)
		client = new LearningTagClient(restService as any)
	})

	it('should call GET /learning-tags/:id/hyperlinks with page parameter', async () => {
		const responseData = {
			results: [
				{
					id: 1,
					title: 'BBC',
					description: 'The BBC is a news website',
					href: 'https://bbc.co.uk'
				}
			],
			page: 0,
			size: 20,
			totalResults: 7,
			totalPages: 1,
			totalElements: 7,
			numberOfElements: 7,
			last: true,
			first: true
		}

		restService.getRequest.resolves({
			data: responseData
		} as any)

		const query = new SearchQuery()
		query.p = 0

		const result = await client.getTaggedHyperlinks(1, query)

		expect(restService.getRequest).to.have.been.calledOnceWith({
			url: '/learning-tags/1/hyperlinks',
			params: {
				page: 0
			}
		})
		expect(result).to.be.instanceOf(LearningTagHyperlinksResponse)
		expect(result.results.length).to.eql(1)
		expect(result.results[0].title).to.eql('BBC')
		expect(result.results[0].description).to.eql('The BBC is a news website')
		expect(result.results[0].href).to.eql('https://bbc.co.uk')
		expect(result.totalResults).to.eql(7)
	})
})
