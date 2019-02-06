import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {mockReq, mockRes} from 'sinon-express-mock'
import {NextFunction, Request, Response} from 'express'
import {Module} from '../../../../src/learning-catalogue/model/module'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {FaceToFaceModuleController} from '../../../../src/controllers/module/faceToFaceModuleController'
import * as sinon from 'sinon'
import {Course} from '../../../../src/learning-catalogue/model/course'
import {CourseService} from 'lib/courseService'

chai.use(sinonChai)

describe('Face-to-face module controller tests', function() {
	let faceToFaceModuleController: FaceToFaceModuleController
	let learningCatalogue: LearningCatalogue
	let moduleValidator: Validator<Module>
	let moduleFactory: ModuleFactory
	let courseService: CourseService

	let req: Request
	let res: Response
	let next: NextFunction

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		moduleValidator = <Validator<Module>>{}
		moduleFactory = <ModuleFactory>{}
		courseService = <CourseService>{}

		faceToFaceModuleController = new FaceToFaceModuleController(learningCatalogue, moduleValidator, moduleFactory, courseService)

		req = mockReq()
		res = mockRes()

		req.session!.save = callback => {
			callback(undefined)
		}

		next = sinon.stub()
	})

	it('Should render module-face-to-face-page', async function() {
		await faceToFaceModuleController.getModule()(req, res)
		expect(res.render).to.have.been.calledOnceWith('page/course/module/module-face-to-face')
	})

	it('Should check for errors and redirect to course preview page', async function() {
		const courseId = 'abc'
		const module = new Module()
		const course = new Course()
		course.id = courseId
		res.locals.course = course

		moduleValidator.check = sinon.stub().returns({fields: [], size: 0})
		moduleFactory.create = sinon.stub().returns(module)
		learningCatalogue.createModule = sinon.stub().returns(Promise.resolve(module))

		await faceToFaceModuleController.setModule()(req, res, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(req.body, ['title', 'description', 'cost'])
		expect(moduleFactory.create).to.have.been.calledOnceWith(req.body)
		expect(learningCatalogue.createModule).to.have.been.calledOnceWith('abc', module)
		expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/preview`)
	})

	it('Should check for errors and redirect to module-face-to-face page', async function() {
		const module = new Module()
		const course = new Course()
		course.id = 'abc'
		res.locals.course = course

		moduleValidator.check = sinon.stub().returns({fields: ['validation.module.duration.empty'], size: 1})
		moduleFactory.create = sinon.stub().returns(module)

		await faceToFaceModuleController.setModule()(req, res, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(req.body, ['title', 'description', 'cost'])
		expect(moduleFactory.create).to.have.been.calledOnceWith(req.body)
		expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/module-face-to-face`)
	})

	it('Should check for errors, update module and redirect to course preview page', async function() {
		const module = new Module()
		const course = new Course()
		course.id = 'abc'
		module.id = 'def'

		const data = {
			title: 'new title',
			description: 'new description',
			cost: 100,
			isOptional: false,
		}

		req.body = data

		res.locals.course = course
		res.locals.module = module

		moduleValidator.check = sinon.stub().returns({})
		learningCatalogue.updateModule = sinon.stub().returns(Promise.resolve(module))

		await faceToFaceModuleController.editModule()(req, res, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(data, ['title', 'description', 'cost'])
		expect(learningCatalogue.updateModule).to.have.been.calledOnceWith('abc', module)
		expect(res.redirect).to.have.been.calledOnceWith('/content-management/courses/abc/preview')

		expect(module.id).to.equal('def')
		expect(module.title).to.equal('new title')
		expect(module.description).to.equal('new description')
		expect(module.cost).to.equal(100)
		expect(module.optional).to.equal(false)
	})

	it('Should check for errors, not update module and redirect to face to face module page', async function() {
		const module = new Module()
		const course = new Course()
		course.id = 'abc'

		res.locals.course = course
		res.locals.module = module

		req.params.moduleId = 'def'

		moduleValidator.check = sinon.stub().returns({size: 1})

		await faceToFaceModuleController.editModule()(req, res, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(req.body, ['title', 'description', 'cost'])
		expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/module-face-to-face/def`)
	})
})
