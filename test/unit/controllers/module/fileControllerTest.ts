import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {FileController} from '../../../../src/controllers/module/fileController'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {Module} from '../../../../src/learning-catalogue/model/module'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {mockReq, mockRes} from 'sinon-express-mock'
import {Request, Response} from 'express'
import * as sinon from 'sinon'
import {expect} from 'chai'
import {Course} from '../../../../src/learning-catalogue/model/course'
import {OauthRestService} from 'lib/http/oauthRestService'

chai.use(sinonChai)

describe('File Controller Test', function() {
	let fileController: FileController
	let learningCatalogue: LearningCatalogue
	let moduleValidator: Validator<Module>
	let moduleFactory: ModuleFactory
	let mediaRestService: OauthRestService

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		moduleValidator = <Validator<Module>>{}
		moduleFactory = <ModuleFactory>{}
		mediaRestService = <OauthRestService>{}

		fileController = new FileController(learningCatalogue, moduleValidator, moduleFactory, mediaRestService)
	})

	it('Should render file module page', async function() {
		const getFile: (request: Request, response: Response) => void = fileController.getFile('file')

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getFile(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/module-file')
	})

	it('Should get media and render file module page', async function() {
		const getFile: (request: Request, response: Response) => void = fileController.getFile('file')

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.session!.sessionFlash = {mediaId: 'mediaId'}

		mediaRestService.get = sinon.stub()

		await getFile(request, response)

		expect(mediaRestService.get).to.have.been.calledOnceWith('/mediaId')
		expect(response.render).to.have.been.calledOnceWith('page/course/module/module-file')
	})

	it('Should check for errors and redirect to course preview page', async function() {
		let course: Course = new Course()
		let module: Module = new Module()

		course.id = 'courseId'

		const setFile: (request: Request, response: Response) => void = fileController.setFile()

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.course = course

		moduleFactory.create = sinon.stub().returns(module)
		moduleValidator.check = sinon.stub().returns({fields: [], size: 0})

		request.body.mediaId = 'mediaId'
		request.body.file = 'file.mp4'
		request.body.type = 'video'
		mediaRestService.get = sinon.stub().returns({
			id: 'mediaId',
			fileSizeKB: 1000,
			path: '/location',
			metadata: {duration: 5.0},
		})

		learningCatalogue.createModule = sinon.stub()

		await setFile(request, response)

		expect(moduleFactory.create).to.have.been.calledTwice
		expect(moduleValidator.check).to.have.been.calledOnceWith(request.body, ['title', 'description', 'mediaId'])
		expect(mediaRestService.get).to.have.been.calledOnceWith('/mediaId')
		expect(learningCatalogue.createModule).to.have.been.calledOnceWith(course.id, module)
	})

	it('should check got errors and redirect to module-file page', async function() {
		let course: Course = new Course()
		let module: Module = new Module()

		course.id = 'courseId'

		const setFile: (request: Request, response: Response) => void = fileController.setFile()

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.course = course

		moduleFactory.create = sinon.stub().returns(module)
		moduleValidator.check = sinon.stub().returns({fields: ['validation_module_title_empty'], size: 1})
		request.params.mediaId = 'mediaId'
		request.body.file = 'file.pdf'
		request.body.type = 'file'
		mediaRestService.get = sinon
			.stub()
			.returns({id: 'mediaId', fileSizeKB: 1000, path: '/location', metadata: {duration: 5.0}})
		request.session!.save = sinon
			.stub()
			.returns(response.redirect(`/content-management/courses/${course.id}/module-file`))

		await setFile(request, response)

		expect(moduleFactory.create).to.have.been.calledOnceWith(request.body)
		expect(moduleValidator.check).to.have.been.calledOnceWith(request.body, ['title', 'description', 'mediaId'])
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/module-file`)
	})
})
