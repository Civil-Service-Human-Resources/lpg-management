import {AxiosInstance} from 'axios'
import {beforeEach, describe, it} from 'mocha'
import * as sinon from 'sinon'
import * as chaiAsPromised from 'chai-as-promised'
import * as chai from 'chai'

import {expect} from 'chai'
import {LearningCatalogueConfig} from '../../../src/learning-catalogue/learningCatalogueConfig'
import {Auth} from 'src/identity/auth'
import {Identity} from '../../../src/identity/identity'
import * as sinonChai from 'sinon-chai'
import {YoutubeRestService} from '../../../src/youtube/youtubeRestService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('YoutubeRestService tests', () => {
	let http: AxiosInstance
	let config = new LearningCatalogueConfig('http://example.org')
	let auth: Auth
	let restService: YoutubeRestService
	let headers: {}
	beforeEach(() => {
		http = <AxiosInstance>{
			defaults: {},
		}
		auth = <Auth>{}
		auth.currentUser = new Identity('user123', [], 'access123')

		restService = new YoutubeRestService(config, auth)
		restService.http = http

		headers = {
			headers: {
				'Content-Type': 'application/json',
			},
		}
	})

	it('should return data from youtube GET request', async () => {
		const path = '/video/video-id'

		const response = {
			data: {
				id: 'youtube-id',
			},
		}

		http.get = sinon.stub().returns(response)

		const data = await restService.get(path)
		expect(data).to.eql(response.data)
		expect(http.get).to.be.calledWith(path, headers)
	})
})
