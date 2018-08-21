import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {YoutubeModuleController} from '../../../src/controllers/Module/youtubeModuleController'
import {ModuleValidator} from '../../../src/learning-catalogue/validator/moduleValidator'
import {ModuleFactory} from '../../../src/learning-catalogue/model/factory/moduleFactory'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {mockReq, mockRes} from 'sinon-express-mock'
import {ContentRequest} from '../../../src/extended'
import * as sinon from 'sinon'
import {Course} from '../../../src/learning-catalogue/model/course'
import {Request, Response} from 'express'
import {expect} from 'chai'
import axios from 'axios'
import {Module} from '../../../src/learning-catalogue/model/module'
import * as config from '../../../src/config'

chai.use(sinonChai)

describe('Youtube Module Controller Test', function() {
	let moduleController: YoutubeModuleController
	let learningCatalogue: LearningCatalogue
	let moduleValidator: ModuleValidator
	let moduleFactory: ModuleFactory

	let youtubeResponse = {
		status: 200,
		data: {
			type: 'video',
			html: '<iframe width="560" height="315" src="https://www.youtube.com/embed/eyU3bRy2x44"',
			items: [
				{
					contentDetails: {
						duration: 'PT10H1M26S',
					},
				},
			],
		},
	}

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		moduleValidator = <ModuleValidator>{}
		moduleFactory = <ModuleFactory>{}

		moduleController = new YoutubeModuleController(learningCatalogue, moduleValidator, moduleFactory)
	})

	it('should check for errors and redirect to course preview page', async function() {
		const course: Course = new Course()
		const module: Module = new Module()

		course.id = 'abc'

		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const url = 'https://www.youtube.com/example'

		const req = request as ContentRequest
		req.params.courseId = 'abc'
		response.locals.course = course

		req.body.type = 'video'
		req.body.location = url

		moduleValidator.check = sinon.stub().returns({fields: [], size: 0})

		moduleFactory.create = sinon.stub().returns(module)

		learningCatalogue.createModule = sinon.stub()

		learningCatalogue.getCourse = sinon.stub().returns(course)

		axios.get = sinon.stub().returns(youtubeResponse)

		await setModule(request, response)

		expect(axios.get).to.have.been.calledWith(
			`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json&key=${config.YOUTUBE_API_KEY}`
		)
		expect(axios.get).to.have.been.calledWith(
			`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=eyU3bRy2x44"&key=${
				config.YOUTUBE_API_KEY
			}`
		)
		expect(learningCatalogue.createModule).to.have.been.calledWith('abc', module)
		expect(response.redirect).to.have.been.calledWith('/content-management/courses/abc/preview')
	})

	it('should check for and find errors and redirect to course preview page', async function() {
		const course: Course = new Course()

		course.id = 'abc'

		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.course = course

		const req = request as ContentRequest
		req.params.courseId = 'abc'

		moduleValidator.check = sinon.stub().returns({fields: ['validation.course.title.empty'], size: 1})

		learningCatalogue.getCourse = sinon.stub().returns(course)

		moduleFactory.create = sinon.stub().returns(module)

		await setModule(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/add-youtube-module`)
	})

	it('should get basic youtube info and redirect to course preview page', async function() {
		const course: Course = new Course()

		course.id = 'abc'

		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.course = course

		const url = 'https://www.youtube.com/example'

		const req = request as ContentRequest
		req.params.courseId = 'abc'

		req.body.type = 'video'
		req.body.location = url

		moduleValidator.check = sinon.stub().returns({fields: [], size: 0})

		learningCatalogue.getCourse = sinon.stub().returns(course)

		youtubeResponse.status = 404
		axios.get = sinon.stub().returns(youtubeResponse)

		moduleFactory.create = sinon.stub().returns(module)

		await setModule(request, response)

		expect(axios.get).to.have.been.calledWith(
			`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json&key=${config.YOUTUBE_API_KEY}`
		)
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/add-youtube-module`)
	})
})
