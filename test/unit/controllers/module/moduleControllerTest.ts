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
import * as sinon from 'sinon'

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

	it('should render add module file page', async function() {
		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {module: 'file'}
		const course = new Course()
		course.title = 'New Course'
		course.id = 'abc123'
		response.locals.course = course
		await setModule(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/module-file`)
	})

	it('should render add module link page', async function() {
		const setModule: (request: Request, response: Response) => void = moduleController.setModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {module: 'link'}
		const course = new Course()
		course.title = 'New Course'
		course.id = 'abc123'
		response.locals.course = course
		await setModule(request, response)

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

	it('should render add file page', async function() {
		const addFile: (request: Request, response: Response) => void = moduleController.addFile()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await addFile(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/module-file')
	})

	it('should delete module', async function() {
		const deleteModule: (request: Request, response: Response) => void = moduleController.deleteModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const course = new Course()
		course.title = 'New Course'
		course.id = 'abc123'
		response.locals.course = course

		learningCatalogue.deleteModule = sinon.stub()

		await deleteModule(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/add-module`)
	})
})
