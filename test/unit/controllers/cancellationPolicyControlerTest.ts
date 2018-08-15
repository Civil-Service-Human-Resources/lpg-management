import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {beforeEach, describe, it} from 'mocha'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {CancellationPolicyController} from '../../../src/controllers/LearningProvider/cancellationPolicyController'
import {CancellationPolicyValidator} from '../../../src/learning-catalogue/validator/cancellationPolicyValidator'
import {CancellationPolicyFactory} from '../../../src/learning-catalogue/model/factory/cancellationPolicyFactory'
import {Request, Response} from 'express'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as sinon from 'sinon'
import {LearningProvider} from '../../../src/learning-catalogue/model/learningProvider'
import {expect} from 'chai'
import {CancellationPolicy} from '../../../src/learning-catalogue/model/cancellationPolicy'

chai.use(sinonChai)

describe('Terms and Conditions Controller Test', function() {
	let cancellationPolicyController: CancellationPolicyController
	let learningCatalogue: LearningCatalogue
	let cancellationPolicyValidator: CancellationPolicyValidator
	let cancellationPolicyFactory: CancellationPolicyFactory

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		cancellationPolicyValidator = <CancellationPolicyValidator>{}
		cancellationPolicyFactory = <CancellationPolicyFactory>{}

		cancellationPolicyController = new CancellationPolicyController(
			learningCatalogue,
			cancellationPolicyValidator,
			cancellationPolicyFactory
		)
	})

	it('should check for errors and redirect to learning-provider page', async function() {
		const setCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.setCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'

		request.body = {name: 'Updated Title', content: 'Cancellation Policy'}

		cancellationPolicyValidator.check = sinon.stub().returns({fields: [], size: 0})

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const cancellationPolicy: CancellationPolicy = new CancellationPolicy()
		learningCatalogue.createCancellationPolicy = sinon.stub().returns(cancellationPolicy)

		cancellationPolicyFactory.create = sinon.stub().returns(cancellationPolicy)

		await setCancellationPolicy(request, response)

		expect(cancellationPolicyValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(learningCatalogue.createCancellationPolicy).to.have.been.calledWith('abc', cancellationPolicy)
		expect(response.redirect).to.have.been.calledOnceWith('/content-management/learning-providers/abc')
	})

	it('should check for errors and render add-cancellation-policy page', async function() {
		const setCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.setCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'

		request.body = {name: 'Updated Title', content: 'Cancellation Policy'}

		const errors = {fields: ['validation.cancellationPolicy.title.empty'], size: 1}

		cancellationPolicyValidator.check = sinon.stub().returns(errors)

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const cancellationPolicy: CancellationPolicy = new CancellationPolicy()

		cancellationPolicyFactory.create = sinon.stub().returns(cancellationPolicy)

		await setCancellationPolicy(request, response)

		expect(cancellationPolicyValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(response.render).to.have.been.calledOnceWith('page/add-cancellation-policy', {
			errors: errors,
			learningProvider: learningProvider,
			cancellationPolicy: cancellationPolicy,
		})
	})

	it('should check for errors in update and redirect to learning-provider page', async function() {
		const updateCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.updateCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'
		request.params.cancellationPolicyId = 'cba'

		request.body = {name: 'Updated Title', content: 'Cancellation Policy'}

		cancellationPolicyValidator.check = sinon.stub().returns({fields: [], size: 0})

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const cancellationPolicy: CancellationPolicy = new CancellationPolicy()
		learningCatalogue.getCancellationPolicy = sinon.stub().returns(cancellationPolicy)

		learningCatalogue.updateCancellationPolicy = sinon.stub()

		await updateCancellationPolicy(request, response)

		expect(cancellationPolicyValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(learningCatalogue.getCancellationPolicy).to.have.been.calledWith('abc', 'cba')
		expect(learningCatalogue.updateCancellationPolicy).to.have.been.calledWith('abc', 'cba', cancellationPolicy)
		expect(response.redirect).to.have.been.calledWith('/content-management/learning-providers/abc')
	})

	it('should check for errors and render to add-terms-and-conditions page', async function() {
		const updateCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.updateCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'
		request.params.cancellationPolicyId = 'cba'

		request.body = {name: 'Updated Title', content: 'Cancellation Policy'}

		const errors = {fields: ['validation.cancellationPolicy.title.empty'], size: 1}
		cancellationPolicyValidator.check = sinon.stub().returns(errors)

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const cancellationPolicy: CancellationPolicy = new CancellationPolicy()
		learningCatalogue.getCancellationPolicy = sinon.stub().returns(cancellationPolicy)

		await updateCancellationPolicy(request, response)

		expect(cancellationPolicyValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(learningCatalogue.getCancellationPolicy).to.have.been.calledWith('abc', 'cba')
		expect(response.render).to.have.been.calledOnceWith('page/add-cancellation-policy', {
			errors: errors,
			learningProvider: learningProvider,
			cancellationPolicy: cancellationPolicy,
			isEdit: true,
		})
	})

	it('should delete terms and conditions and redirect to learning-providers page', async function() {
		const deleteCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.deleteCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'
		request.params.cancellationPolicyId = 'cba'

		learningCatalogue.deleteCancellationPolicy = sinon.stub()

		await deleteCancellationPolicy(request, response)

		expect(learningCatalogue.deleteCancellationPolicy).to.have.been.calledWith('abc', 'cba')
		expect(response.redirect).to.have.been.calledWith('/content-management/learning-providers/abc')
	})
})
