import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import * as sinon from 'sinon'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {CancellationPolicyController} from '../../../../src/controllers/learningProvider/cancellationPolicyController'
import {CancellationPolicy} from '../../../../src/learning-catalogue/model/cancellationPolicy'
import {CancellationPolicyFactory} from '../../../../src/learning-catalogue/model/factory/cancellationPolicyFactory'

chai.use(sinonChai)

describe('Cancellation Policy Controller Tests', function() {
	let cancellationPolicyController: CancellationPolicyController
	let learningCatalogue: LearningCatalogue
	let cancellationPolicyValidator: Validator<CancellationPolicy>
	let cancellationPolicyFactory: CancellationPolicyFactory

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		cancellationPolicyFactory = <CancellationPolicyFactory>{}
		cancellationPolicyValidator = <Validator<CancellationPolicy>>{}

		cancellationPolicyController = new CancellationPolicyController(
			learningCatalogue,
			cancellationPolicyFactory,
			cancellationPolicyValidator
		)
	})

	it('should call get cancellation policy page ', async function() {
		const getCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.getCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getCancellationPolicy(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/learning-provider/cancellation-policy')
	})

	it('should call set cancellation policy and redirect if errors', async function() {
		const learningProviderId = 'lp-123'
		const setCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.setCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {name: ''}
		request.params.learningProviderId = learningProviderId
		const cancellationPolicy = new CancellationPolicy()
		cancellationPolicyFactory.create = sinon.stub().returns(cancellationPolicy)

		const errors = {fields: ['validation.cancellation.policy.title.empty'], size: 1}
		cancellationPolicyValidator.check = sinon.stub().returns(errors)

		await setCancellationPolicy(request, response)

		expect(cancellationPolicyFactory.create).to.have.been.calledWith(request.body)
		expect(cancellationPolicyValidator.check).to.have.been.calledWith(request.body, ['name'])
		expect(cancellationPolicyValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash.errors).to.equal(errors)

		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}/cancellation-policies`
		)
	})

	it('should call set cancellation policy, create and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const setCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.setCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {name: ''}
		request.params.learningProviderId = learningProviderId
		const cancellationPolicy = new CancellationPolicy()
		cancellationPolicyFactory.create = sinon.stub().returns(cancellationPolicy)

		learningCatalogue.createCancellationPolicy = sinon.stub().returns('123')

		const errors = {fields: [], size: 0}
		cancellationPolicyValidator.check = sinon.stub().returns(errors)

		await setCancellationPolicy(request, response)

		expect(cancellationPolicyFactory.create).to.have.been.calledWith(request.body)
		expect(cancellationPolicyValidator.check).to.have.been.calledWith(request.body, ['name'])
		expect(cancellationPolicyValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash).to.not.exist
		expect(learningCatalogue.createCancellationPolicy).to.have.been.calledWith(
			learningProviderId,
			cancellationPolicy
		)

		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}`
		)
	})

	it('should call set cancellation policy, edit and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const cancellationPolicyId = 'cp-123'
		const setCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.setCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {name: ''}
		request.params.learningProviderId = learningProviderId
		request.params.cancellationPolicyId = cancellationPolicyId

		const cancellationPolicy = new CancellationPolicy()
		cancellationPolicy.id = cancellationPolicyId
		cancellationPolicyFactory.create = sinon.stub().returns(cancellationPolicy)
		response.locals.cancellationPolicy = cancellationPolicy

		const errors = {fields: [], size: 0}
		cancellationPolicyValidator.check = sinon.stub().returns(errors)

		learningCatalogue.updateCancellationPolicy = sinon.stub().returns('123')

		await setCancellationPolicy(request, response)

		expect(cancellationPolicyFactory.create).to.have.been.calledWith(request.body)
		expect(cancellationPolicyValidator.check).to.have.been.calledWith(request.body, ['name'])
		expect(cancellationPolicyValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash).to.not.exist
		expect(learningCatalogue.updateCancellationPolicy).to.have.been.calledWith(
			learningProviderId,
			cancellationPolicy
		)

		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}`
		)
	})

	it('should call delete cancellation policy and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const cancellationPolicyId = 'cp-123'

		const deleteCancellationPolicy: (
			request: Request,
			response: Response
		) => void = cancellationPolicyController.deleteCancellationPolicy()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = learningProviderId
		request.params.cancellationPolicyId = cancellationPolicyId

		learningCatalogue.deleteCancellationPolicy = sinon.stub()

		await deleteCancellationPolicy(request, response)

		expect(learningCatalogue.deleteCancellationPolicy).to.have.been.calledOnceWith(
			learningProviderId,
			cancellationPolicyId
		)
		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}`
		)
	})
})
