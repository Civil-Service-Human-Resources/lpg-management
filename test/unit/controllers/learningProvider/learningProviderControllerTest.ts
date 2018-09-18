import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import * as sinon from 'sinon'
import {LearningProviderFactory} from '../../../../src/learning-catalogue/model/factory/learningProviderFactory'
import {LearningProvider} from '../../../../src/learning-catalogue/model/learningProvider'
import {Pagination} from '../../../../src/lib/pagination'
import {LearningProviderController} from '../../../../src/controllers/learningProvider/learningProviderController'
import {PageResults} from '../../../../src/learning-catalogue/model/pageResults'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {LearningCatalogue} from '../../../../src/learning-catalogue'

chai.use(sinonChai)

describe('Learning Provider Controller Tests', function() {
	const accessToken: string = 'lZcQoUlwuA6frjTRY5gfuH3fEOJHFRd58UblAzUgxp'
	const requestConfig: object = {
		session: {
			passport: {
				user: `{"uid":"8dc80f78-9a52-4c31-ac54-d280a70c18eb","roles":["COURSE_MANAGER"],"accessToken":"${accessToken}"}`,
			},
		},
	}

	let learningCatalogue: LearningCatalogue
	let learningProviderFactory: LearningProviderFactory
	let learningProviderController: LearningProviderController
	let learningProviderValidator: Validator<LearningProvider>
	let pagination: Pagination

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		learningProviderFactory = <LearningProviderFactory>{}
		learningProviderValidator = <Validator<LearningProvider>>{}
		pagination = new Pagination()

		learningProviderController = new LearningProviderController(
			learningCatalogue,
			learningProviderFactory,
			learningProviderValidator,
			pagination
		)
	})

	it('should call learning providers page', async function() {
		const index: (request: Request, response: Response) => void = learningProviderController.index()

		const learningProvider: LearningProvider = new LearningProvider()
		learningProvider.id = 'learning-provider-id'
		learningProvider.name = 'learning-provider-name'

		const pageResults: PageResults<LearningProvider> = {
			page: 0,
			size: 10,
			totalResults: 21,
			results: [learningProvider],
		} as PageResults<LearningProvider>

		const listLearningProviders = sinon.stub().returns(Promise.resolve(pageResults))
		learningCatalogue.listLearningProviders = listLearningProviders

		const request: Request = mockReq(requestConfig)
		const response: Response = mockRes()

		await index(request, response)
		expect(learningCatalogue.listLearningProviders).to.have.been.calledWith(accessToken, 0, 10)

		expect(response.render).to.have.been.calledOnceWith('page/learning-provider/learning-providers', {pageResults})
	})

	it('should call learning provider page with correct page and size', async function() {
		const learningProvider: LearningProvider = new LearningProvider()
		learningProvider.id = 'course-id'
		learningProvider.name = 'course-title'

		const pageResults: PageResults<LearningProvider> = {
			page: 0,
			size: 10,
			totalResults: 21,
			results: [learningProvider],
		} as PageResults<LearningProvider>

		const listLearningProviders = sinon.stub().returns(Promise.resolve(pageResults))
		learningCatalogue.listLearningProviders = listLearningProviders

		const index: (request: Request, response: Response) => void = learningProviderController.index()

		const request: Request = mockReq(requestConfig)
		const response: Response = mockRes()

		request.query.p = 3
		request.query.s = 5

		await index(request, response)

		expect(learningCatalogue.listLearningProviders).to.have.been.calledWith(accessToken, 3, 5)

		expect(response.render).to.have.been.calledOnceWith('page/learning-provider/learning-providers', {
			pageResults,
		})
	})

	it('should call get learning provider page ', async function() {
		const getLearningProvider: (
			request: Request,
			response: Response
		) => void = learningProviderController.getLearningProvider()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getLearningProvider(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/learning-provider/learning-provider')
	})

	it('should call get learning provider overview page ', async function() {
		const getLearningProviderOverview: (
			request: Request,
			response: Response
		) => void = learningProviderController.getLearningProviderOverview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getLearningProviderOverview(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/learning-provider/learning-provider-overview')
	})

	it('should call set learning provider overview page and redirect if errors', async function() {
		const setLearningProvider: (
			request: Request,
			response: Response
		) => void = learningProviderController.setLearningProvider()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {name: ''}

		const learningProvider = new LearningProvider()
		learningProviderFactory.create = sinon.stub().returns(learningProvider)

		const errors = {fields: ['validation.course.title.empty'], size: 1}
		learningProviderValidator.check = sinon.stub().returns(errors)

		await setLearningProvider(request, response)

		expect(learningProviderFactory.create).to.have.been.calledWith(request.body)
		expect(learningProviderValidator.check).to.have.been.calledWith(request.body, ['name'])
		expect(learningProviderValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash.errors).to.equal(errors)

		expect(response.redirect).to.have.been.calledOnceWith(
			'/content-management/learning-providers/learning-provider'
		)
	})

	it('should call set learning provider page and redirect to new learning provider if no errors', async function() {
		const setLearningProvider: (
			request: Request,
			response: Response
		) => void = learningProviderController.setLearningProvider()

		const request: Request = mockReq(requestConfig)
		const response: Response = mockRes()

		request.body = {name: 'learning-provider-name'}

		const learningProvider = new LearningProvider()
		learningProviderFactory.create = sinon.stub().returns(learningProvider)
		learningCatalogue.createLearningProvider = sinon.stub().returns('123')

		const errors = {fields: [], size: 0}
		learningProviderValidator.check = sinon.stub().returns(errors)

		await setLearningProvider(request, response)

		expect(learningProviderFactory.create).to.have.been.calledWith(request.body)
		expect(learningProviderValidator.check).to.have.been.calledWith(request.body, ['name'])
		expect(learningProviderValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash).to.not.exist
		expect(learningCatalogue.createLearningProvider).to.have.been.calledWith(learningProvider, accessToken)

		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProvider.id}`
		)
	})
})
