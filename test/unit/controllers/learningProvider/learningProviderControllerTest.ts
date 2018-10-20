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
	let learningCatalogue: LearningCatalogue
	let learningProviderFactory: LearningProviderFactory
	let learningProviderController: LearningProviderController
	let learningProviderValidator: Validator<LearningProvider>
	let pagination: Pagination

	let req: Request
	let res: Response

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

		req = mockReq()
		res = mockRes()

		req.session!.save = callback => {
			callback(undefined)
		}
	})

	it('should call learning providers page', async function() {
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

		await learningProviderController.index()(req, res)
		expect(learningCatalogue.listLearningProviders).to.have.been.calledWith(0, 10)

		expect(res.render).to.have.been.calledOnceWith('page/learning-provider/learning-providers', {pageResults})
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

		req.query.p = 3
		req.query.s = 5

		await learningProviderController.index()(req, res)

		expect(learningCatalogue.listLearningProviders).to.have.been.calledWith(3, 5)

		expect(res.render).to.have.been.calledOnceWith('page/learning-provider/learning-providers', {
			pageResults,
		})
	})

	it('should call get learning provider page ', async function() {
		await learningProviderController.getLearningProvider()(req, res)
		expect(res.render).to.have.been.calledOnceWith('page/learning-provider/learning-provider')
	})

	it('should call get learning provider overview page ', async function() {
		await learningProviderController.getLearningProviderOverview()(req, res)
		expect(res.render).to.have.been.calledOnceWith('page/learning-provider/learning-provider-overview')
	})

	it('should call set learning provider overview page and redirect if errors', async function() {
		req.body = {name: ''}
		const learningProvider = new LearningProvider()
		learningProviderFactory.create = sinon.stub().returns(learningProvider)

		const errors = {fields: ['validation.course.title.empty'], size: 1}
		learningProviderValidator.check = sinon.stub().returns(errors)

		await learningProviderController.setLearningProvider()(req, res)

		expect(learningProviderFactory.create).to.have.been.calledWith(req.body)
		expect(learningProviderValidator.check).to.have.been.calledWith(req.body, ['name'])
		expect(learningProviderValidator.check).to.have.returned(errors)
		expect(req.session!.sessionFlash.errors).to.equal(errors)

		expect(res.redirect).to.have.been.calledOnceWith('/content-management/learning-providers/learning-provider')
	})

	it('should call set learning provider page and redirect to new learning provider if no errors', async function() {
		req.body = {name: 'learning-provider-name'}

		const learningProvider = new LearningProvider()
		learningProviderFactory.create = sinon.stub().returns(learningProvider)
		learningCatalogue.createLearningProvider = sinon.stub().returns('123')

		const errors = {fields: [], size: 0}
		learningProviderValidator.check = sinon.stub().returns(errors)

		await learningProviderController.setLearningProvider()(req, res)

		expect(learningProviderFactory.create).to.have.been.calledWith(req.body)
		expect(learningProviderValidator.check).to.have.been.calledWith(req.body, ['name'])
		expect(learningProviderValidator.check).to.have.returned(errors)
		expect(req.session!.sessionFlash).to.not.exist
		expect(learningCatalogue.createLearningProvider).to.have.been.calledWith(learningProvider)

		expect(res.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProvider.id}`
		)
	})
})
