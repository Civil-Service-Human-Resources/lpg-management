import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {mockReq, mockRes} from 'sinon-express-mock'
import {Request, Response} from 'express'
import {Module} from '../../../../src/learning-catalogue/model/module'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {FaceToFaceModuleController} from '../../../../src/controllers/module/faceToFaceModuleController'
import * as sinon from 'sinon'
import {Course} from '../../../../src/learning-catalogue/model/course'

chai.use(sinonChai)

describe('Face-to-face module controller tests', function() {
	let faceToFaceModuleController: FaceToFaceModuleController
	let learningCatalogue: LearningCatalogue
	let moduleValidator: Validator<Module>
	let moduleFactory: ModuleFactory

	let req: Request
	let res: Response

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		moduleValidator = <Validator<Module>>{}
		moduleFactory = <ModuleFactory>{}

		faceToFaceModuleController = new FaceToFaceModuleController(learningCatalogue, moduleValidator, moduleFactory)

		req = mockReq()
		res = mockRes()

		req.session!.save = callback => {
			callback(undefined)
		}
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
		learningCatalogue.createModule = sinon.stub()

		await faceToFaceModuleController.setModule()(req, res)

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

		await faceToFaceModuleController.setModule()(req, res)

		expect(moduleValidator.check).to.have.been.calledOnceWith(req.body, ['title', 'description', 'cost'])
		expect(moduleFactory.create).to.have.been.calledOnceWith(req.body)
		expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/module-face-to-face`)
	})
})
