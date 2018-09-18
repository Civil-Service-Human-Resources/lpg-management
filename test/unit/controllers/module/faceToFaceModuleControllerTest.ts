import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {mockReq, mockRes} from 'sinon-express-mock'
import {Request, Response} from 'express'
import {expect} from 'chai'
import {Module} from '../../../../src/learning-catalogue/model/module'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {FaceToFaceModuleController} from '../../../../src/controllers/module/faceToFaceModuleController'
import * as sinon from 'sinon'
import {ContentRequest} from '../../../../src/extended'
import {Course} from '../../../../src/learning-catalogue/model/course'

chai.use(sinonChai)

describe('Face-to-face module controller tests', function() {
	const accessToken: string = 'lZcQoUlwuA6frjTRY5gfuH3fEOJHFRd58UblAzUgxp'
	const requestConfig: object = {
		session: {
			passport: {
				user: `{"uid":"8dc80f78-9a52-4c31-ac54-d280a70c18eb","roles":["COURSE_MANAGER"],"accessToken":"${accessToken}"}`,
			},
		},
	}
	let faceToFaceModuleController: FaceToFaceModuleController
	let learningCatalogue: LearningCatalogue
	let moduleValidator: Validator<Module>
	let moduleFactory: ModuleFactory

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		moduleValidator = <Validator<Module>>{}
		moduleFactory = <ModuleFactory>{}

		faceToFaceModuleController = new FaceToFaceModuleController(learningCatalogue, moduleValidator, moduleFactory)
	})

	it('Should render module-face-to-face-page', async function() {
		const getModule: (request: Request, response: Response) => void = faceToFaceModuleController.getModule()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getModule(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/module-face-to-face')
	})

	it('Should check for errors and redirect to course preview page', async function() {
		const module = new Module()
		const course = new Course()

		course.id = 'abc'

		const setModule: (request: Request, response: Response) => void = faceToFaceModuleController.setModule()

		const request: Request = mockReq(requestConfig)
		const response: Response = mockRes()

		const req = request as ContentRequest

		response.locals.course = course

		moduleValidator.check = sinon.stub().returns({fields: [], size: 0})

		moduleFactory.create = sinon.stub().returns(module)

		learningCatalogue.createModule = sinon.stub()

		await setModule(request, response)

		expect(moduleValidator.check).to.have.been.calledOnceWith(req.body, ['title', 'description'])
		expect(moduleFactory.create).to.have.been.calledOnceWith(req.body)
		expect(learningCatalogue.createModule).to.have.been.calledOnceWith('abc', module, accessToken)
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/preview`)
	})

	it('Should check for errors and redirect to module-face-to-face page', async function() {
		const module = new Module()
		const course = new Course()

		course.id = 'abc'

		const setModule: (request: Request, response: Response) => void = faceToFaceModuleController.setModule()

		const request: Request = mockReq(requestConfig)
		const response: Response = mockRes()

		const req = request as ContentRequest

		response.locals.course = course

		moduleValidator.check = sinon.stub().returns({fields: ['validation.module.duration.empty'], size: 1})

		moduleFactory.create = sinon.stub().returns(module)

		await setModule(request, response)

		expect(moduleValidator.check).to.have.been.calledOnceWith(req.body, ['title', 'description'])
		expect(moduleFactory.create).to.have.been.calledOnceWith(req.body)
		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/abc/module-face-to-face`)
	})
})
