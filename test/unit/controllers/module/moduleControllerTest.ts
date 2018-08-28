import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {ModuleController} from '../../../../src/controllers/module/moduleController'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {Course} from '../../../../src/learning-catalogue/model/course'

chai.use(sinonChai)

describe('Module Controller Tests', function() {
	let moduleController: ModuleController
	let learningCatalogue: LearningCatalogue
	let moduleFactory: ModuleFactory

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}

		moduleFactory = <ModuleFactory>{}

		moduleController = new ModuleController(learningCatalogue, moduleFactory)
	})

	it('should render add module page', async function() {
		const addModule: (request: Request, response: Response) => void = moduleController.addModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await addModule(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/add-module')
	})

	it('should render add module type page', async function() {
		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {module: 'link'}
		const course = new Course()
		course.title = 'New Course'
		course.id = 'abc123'
		response.locals.course = course
		await setModule(request, response)
		//To be done - would expect to render form for specific module type
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/module-link`)
	})

	it('should remain on add module page if no course is selected', async function() {
		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {module: ''}
		const course = new Course()
		course.title = 'New Course'
		course.id = 'abc123'
		response.locals.course = course
		await setModule(request, response)
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/add-module`)
	})
})
