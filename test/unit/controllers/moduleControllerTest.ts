import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {ModuleController} from '../../../src/controllers/Module/moduleController'
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

chai.use(sinonChai)

describe('Module Controller Test', function() {
	let moduleController: ModuleController
	let learningCatalogue: LearningCatalogue
	let moduleValidator: ModuleValidator
	let moduleFactory: ModuleFactory
	let youtubeResponse = {
		status: 200,
		data: {
			type: 'video',
			html:
				'<iframe width="560" height="315" src="https://www.youtube.com/embed/eyU3bRy2x44" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
			data: {
				kind: 'youtube#videoListResponse',
				etag: '"XI7nbFXulYBIpL0ayR_gDh3eu1k/I75CYyF1dj7d78g6fzFhqauja-I"',
				pageInfo: {totalResults: 1, resultsPerPage: 1},
			},
			items: [
				{
					kind: 'youtube#video',
					etag: '"XI7nbFXulYBIpL0ayR_gDh3eu1k/NOrWDxfGU4iYvLGoy5wJovpxoDM"',
					id: 'ZY3J3Y_OU0w',
					contentDetails: {
						duration: 'PT10H1M26S',
						dimension: '2d',
						definition: 'hd',
						caption: 'false',
						licensedContent: false,
						projection: 'rectangular',
					},
				},
			],
		},
	}

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		moduleValidator = <ModuleValidator>{}
		moduleFactory = <ModuleFactory>{}

		moduleController = new ModuleController(learningCatalogue, moduleValidator, moduleFactory)
	})

	it('should check for errors and redirect to course preview page', async function() {
		const course: Course = new Course()
		const module: Module = new Module()

		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const req = request as ContentRequest
		req.params.courseId = 'abc'

		req.body.type = 'video'
		req.body.location = 'url'

		moduleValidator.check = sinon.stub().returns({fields: [], size: 0})

		moduleFactory.create = sinon.stub().returns(module)

		learningCatalogue.createModule = sinon.stub()

		learningCatalogue.getCourse = sinon.stub().returns(course)

		axios.get = sinon.stub().returns(youtubeResponse)

		await setModule(request, response)

		expect(learningCatalogue.createModule).to.have.been.calledWith('abc', module)
		expect(response.redirect).to.have.been.calledWith('/content-management/course-preview/abc')
	})

	it('should check for errors and redirect to course preview page', async function() {
		const course: Course = new Course()

		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const req = request as ContentRequest
		req.params.courseId = 'abc'

		moduleValidator.check = sinon.stub().returns({fields: ['validation.course.title.empty'], size: 1})

		learningCatalogue.getCourse = sinon.stub().returns(course)

		await setModule(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/course-preview/abc`)
	})

	it('should get basic youtube info and send http status 500', async function() {
		const course: Course = new Course()

		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const req = request as ContentRequest
		req.params.courseId = 'abc'

		req.body.type = 'video'
		req.body.location = 'url'

		moduleValidator.check = sinon.stub().returns({fields: [], size: 0})

		learningCatalogue.getCourse = sinon.stub().returns(course)

		youtubeResponse.status = 404
		axios.get = sinon.stub().returns(youtubeResponse)

		await setModule(request, response)

		expect(response.sendStatus).to.have.been.calledWith(500)
	})
})
