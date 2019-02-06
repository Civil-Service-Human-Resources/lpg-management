import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {FileController} from '../../../../src/controllers/module/fileController'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {Module} from '../../../../src/learning-catalogue/model/module'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {mockReq, mockRes} from 'sinon-express-mock'
import {NextFunction, Request, Response} from 'express'
import * as sinon from 'sinon'
import {expect} from 'chai'
import {Course} from '../../../../src/learning-catalogue/model/course'
import {OauthRestService} from 'lib/http/oauthRestService'
import {CourseService} from 'lib/courseService'
import {VideoModule} from '../../../../src/learning-catalogue/model/videoModule'
import * as config from '../../../../src/config'

chai.use(sinonChai)

describe('File Controller Test', function() {
	let fileController: FileController
	let learningCatalogue: LearningCatalogue
	let moduleValidator: Validator<Module>
	let moduleFactory: ModuleFactory
	let mediaRestService: OauthRestService
	let courseService: CourseService
	let next: NextFunction

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		moduleValidator = <Validator<Module>>{}
		moduleFactory = <ModuleFactory>{}
		mediaRestService = <OauthRestService>{}

		fileController = new FileController(learningCatalogue, moduleValidator, moduleFactory, mediaRestService, courseService)

		next = sinon.stub()
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

	it('Should get mediaId, get media and render file module page', async function() {
		const module: VideoModule = new VideoModule()
		module.url = '/test/path/mediaId/file.mp4'
		module.type = Module.Type.VIDEO

		const getFile: (request: Request, response: Response) => void = fileController.getFile('video')

		const request: Request = mockReq()
		const response: Response = mockRes()

		mediaRestService.get = sinon.stub().returns({id: 'mediaId'})

		request.params.moduleId = 'moduleId'
		response.locals.module = module

		await getFile(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/module-file', {
			type: 'video',
			media: {id: 'mediaId'},
			courseCatalogueUrl: config.COURSE_CATALOGUE.url + '/media',
		})
	})

	it('Should check for errors and redirect to course preview page', async function() {
		let course: Course = new Course()
		let module: Module = new Module()

		course.id = 'courseId'

		const setFile: (request: Request, response: Response, next: NextFunction) => void = fileController.setFile()

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

		learningCatalogue.createModule = sinon.stub().returns(Promise.resolve(module))

		await setFile(request, response, next)

		expect(moduleFactory.create).to.have.been.calledTwice
		expect(moduleValidator.check).to.have.been.calledOnceWith(request.body, ['title', 'description', 'mediaId'])
		expect(mediaRestService.get).to.have.been.calledOnceWith('/mediaId')
		expect(learningCatalogue.createModule).to.have.been.calledOnceWith(course.id, module)
	})

	it('should check for errors and redirect to module-file page', async function() {
		let course: Course = new Course()
		let module: Module = new Module()

		course.id = 'courseId'

		const setFile: (request: Request, response: Response, next: NextFunction) => void = fileController.setFile()

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.course = course

		moduleFactory.create = sinon.stub().returns(module)
		moduleValidator.check = sinon.stub().returns({fields: ['validation_module_title_empty'], size: 1})
		request.params.mediaId = 'mediaId'
		request.body.file = 'file.pdf'
		request.body.type = 'file'
		mediaRestService.get = sinon.stub().returns({id: 'mediaId', fileSizeKB: 1000, path: '/location', metadata: {duration: 5.0}})
		request.session!.save = sinon.stub().returns(response.redirect(`/content-management/courses/${course.id}/module-file`))

		await setFile(request, response, next)

		expect(moduleFactory.create).to.have.been.calledOnceWith(request.body)
		expect(moduleValidator.check).to.have.been.calledOnceWith(request.body, ['title', 'description', 'mediaId'])
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/module-file`)
	})

	it('should check for errors, update module and redirect to course preview page', async function() {
		const course = new Course()
		const module = new Module()

		course.id = 'courseId'
		module.id = 'moduleId'

		const data = {
			file: 'test.pdf',
			mediaId: 'mediaId',
			type: 'file',
			title: 'new title',
			description: 'new description',
			isOptional: false,
			hours: 1,
			minutes: 10,
		}

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.course = course
		response.locals.module = module

		request.body = data

		moduleValidator.check = sinon.stub().returns({})
		mediaRestService.get = sinon.stub().returns({id: 'mediaId', fileSizeKB: 1000, path: '/location', metadata: {duration: 5.0}})
		request.session!.save = sinon.stub().returns(response.redirect(`/content-management/courses/${course.id}/preview`))
		learningCatalogue.updateModule = sinon.stub().returns(Promise.resolve(module))

		await fileController.editFile()(request, response, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(request.body, ['title', 'description', 'mediaId'])
		expect(mediaRestService.get).to.have.been.calledOnceWith(`/mediaId`)
		expect(learningCatalogue.updateModule).to.have.been.calledOnceWith('courseId', module)
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/preview`)

		expect(module.type).to.equal('file')
		expect(module.title).to.equal('new title')
		expect(module.description).to.equal('new description')
		expect(module.optional).to.equal(false)
		expect(module.duration).to.equal(4200)
	})

	it('should check for errors, update module and redirect to module-file page', async function() {
		const course = new Course()
		const module = new Module()

		course.id = 'courseId'
		module.id = 'moduleId'

		const data = {
			file: 'test.pdf',
			mediaId: 'mediaId',
			type: 'file',
			title: 'new title',
			description: 'new description',
			isOptional: false,
			hours: 1,
			minutes: 10,
		}

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.course = course
		response.locals.module = module

		request.body = data

		moduleValidator.check = sinon.stub().returns({size: 1})
		mediaRestService.get = sinon.stub().returns({id: 'mediaId', fileSizeKB: 1000, path: '/location', metadata: {duration: 5.0}})
		request.session!.save = sinon.stub().returns(response.redirect(`/content-management/courses/${course.id}/module-file`))

		await fileController.editFile()(request, response, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(request.body, ['title', 'description', 'mediaId'])
		expect(mediaRestService.get).to.have.been.calledOnceWith(`/mediaId`)
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/module-file`)
	})
})
