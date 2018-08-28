import sinonChai = require('sinon-chai')
import * as chai from 'chai'
import {YoutubeService} from '../../../src/lib/youtubeService'
import {YoutubeConfig} from '../../../src/lib/youtubeConfig'
import {RestService} from '../../../src/learning-catalogue/service/restService'
import * as sinon from 'sinon'
import * as config from '../../../src/config'
import {expect} from 'chai'

chai.use(sinonChai)

describe('Youtube Service Test', function() {
	let youtubeService: YoutubeService
	let youtubeConfig: YoutubeConfig
	let _restService: RestService

	let youtubeResponse: any

	beforeEach(() => {
		youtubeConfig = <YoutubeConfig>{}
		_restService = <RestService>{}

		youtubeService = new YoutubeService(youtubeConfig)
		youtubeService._restService = _restService

		youtubeResponse = {
			status: 200,
			data: {
				type: 'video',
				title: 'a video',
				html:
					'<iframe width="560" height="315" src="https://www.youtubeService.com/embed/example?feature=oembed"',
				height: 1,
				width: 2,
				thumbnail_height: 3,
				thumbnail_width: 4,
				thumbnail_url: 'abc',
				items: [
					{
						contentDetails: {
							duration: 'PT10H1M26S',
						},
					},
				],
			},
		}
	})

	it('Should get and return response from Youtube', async function() {
		const url = 'https://www.youtubeService.com/example'
		const requestUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json&key=${
			config.YOUTUBE_API_KEY
		}`

		_restService.get = sinon.stub().returns(youtubeResponse)

		const response = await youtubeService.getYoutubeResponse(url)

		expect(response).to.be.eql(response)
		expect(_restService.get).to.have.been.calledOnceWith(requestUrl)
	})

	it('Should get response from Youtube and throw error', async function() {
		const url = 'https://www.youtubeService.com/example'
		const requestUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json&key=${
			config.YOUTUBE_API_KEY
		}`

		const error = new Error('Error In Test')

		_restService.get = sinon.stub().throws(error)

		const response = await youtubeService.getYoutubeResponse(url)

		expect(response).to.be.undefined
		expect(_restService.get).to.have.been.calledOnceWith(requestUrl)
	})

	it('Should check response and return true', async function() {
		const response = youtubeService.checkYoutubeResponse(youtubeResponse.data)

		expect(response).to.be.true
	})

	it('Should check response type and return false', async function() {
		youtubeResponse.data.type = ''

		const response = youtubeService.checkYoutubeResponse(youtubeResponse.data)

		expect(response).to.be.false
	})

	it('should check response suffix and return false', async function() {
		youtubeResponse.data.html = '<iframe width="560" height="315" src="https://www.youtubeService.com/embed/'

		// let spy = sinon.spy(youtubeResponse.data.html.split)

		const response = youtubeService.checkYoutubeResponse(youtubeResponse.data)

		// expect(spy).to.have.been.calledOnceWith('embed/')
		expect(response).to.be.false
	})

	it('should check response if and return false', async function() {
		youtubeResponse.data.html = '<iframe width="560" height="315" src="https://www.youtubeService.com/embed/?'

		const response = youtubeService.checkYoutubeResponse(youtubeResponse.data)

		expect(response).to.be.false
	})

	it('should get basic info from youtubeService response', async function() {
		const response = youtubeService.getBasicYoutubeInfo(youtubeResponse.data)

		expect(response.height).to.be.eql(youtubeResponse.data.height)
		expect(response.width).to.be.eql(youtubeResponse.data.width)
		expect(response.thumbnail_height).to.be.eql(youtubeResponse.data.thumbnail_height)
		expect(response.thumbnail_width).to.be.eql(youtubeResponse.data.thumbnail_width)
		expect(response.thumbnail_url).to.be.eql(youtubeResponse.data.thumbnail_url)
		expect(response.title).to.eql(youtubeResponse.data.title)
		expect(response.id).to.be.eql('example')
	})

	it('should get duration from YouTube and return parsed duration', async function() {
		_restService.get = sinon.stub().returns(youtubeResponse.data)

		const response = await youtubeService.getDuration('example')

		expect(response).to.be.eql(36086)
	})

	it('should get duration from YouTube and throw error', async function() {
		const error = new Error('Error in test')

		_restService.get = sinon.stub().throws(error)

		const response = await youtubeService.getDuration('example')

		expect(response).to.be.undefined
	})

	it('should get duration from Youtube and return undefined', async function() {
		youtubeResponse.data.items = null

		_restService.get = sinon.stub().returns(youtubeResponse.data)

		const response = await youtubeService.getDuration('example')

		expect(response).to.be.undefined
	})
})
