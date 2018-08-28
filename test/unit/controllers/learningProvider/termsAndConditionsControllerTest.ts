import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import * as sinon from 'sinon'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {TermsAndConditionsController} from '../../../../src/controllers/learningProvider/termsAndConditionsController'
import {TermsAndConditionsFactory} from '../../../../src/learning-catalogue/model/factory/termsAndConditionsFactory'
import {TermsAndConditions} from '../../../../src/learning-catalogue/model/termsAndConditions'

chai.use(sinonChai)

describe('Terms and Conditions Controller Tests', function() {
	let termsAndConditionsController: TermsAndConditionsController
	let learningCatalogue: LearningCatalogue
	let termsAndConditionsValidator: Validator<TermsAndConditions>
	let termsAndConditionsFactory: TermsAndConditionsFactory

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		termsAndConditionsFactory = <TermsAndConditionsFactory>{}
		termsAndConditionsValidator = <Validator<TermsAndConditions>>{}

		termsAndConditionsController = new TermsAndConditionsController(
			learningCatalogue,
			termsAndConditionsFactory,
			termsAndConditionsValidator
		)
	})

	it('should call get terms and conditions page ', async function() {
		const getTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.getTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getTermsAndConditions(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/learning-provider/terms-and-conditions')
	})

	it('should call set terms and conditions and redirect if errors', async function() {
		const learningProviderId = 'lp-123'
		const setTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.setTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {name: ''}
		request.params.learningProviderId = learningProviderId
		const termsAndConditions = new TermsAndConditions()
		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)

		const errors = {fields: ['validation.terms.and.conditions.policy.title.empty'], size: 1}
		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		await setTermsAndConditions(request, response)

		expect(termsAndConditionsFactory.create).to.have.been.calledWith(request.body)
		expect(termsAndConditionsValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(termsAndConditionsValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash.errors).to.equal(errors)

		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}/terms-and-conditions`
		)
	})

	it('should call set terms and conditions, create and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const setTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.setTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {name: ''}
		request.params.learningProviderId = learningProviderId
		const termsAndConditions = new TermsAndConditions()
		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)

		learningCatalogue.createTermsAndConditions = sinon.stub().returns('123')

		const errors = {fields: [], size: 0}
		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		await setTermsAndConditions(request, response)

		expect(termsAndConditionsFactory.create).to.have.been.calledWith(request.body)
		expect(termsAndConditionsValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(termsAndConditionsValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash).to.not.exist
		expect(learningCatalogue.createTermsAndConditions).to.have.been.calledWith(
			learningProviderId,
			termsAndConditions
		)

		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}`
		)
	})

	it('should call set terms and conditions, edit and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const termsAndConditionsId = 'tc-123'
		const setTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.setTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {name: ''}
		request.params.learningProviderId = learningProviderId
		request.params.termsAndConditionsId = termsAndConditionsId

		const termsAndConditions = new TermsAndConditions()
		termsAndConditions.id = termsAndConditionsId
		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)
		response.locals.termsAndConditions = termsAndConditions

		const errors = {fields: [], size: 0}
		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		learningCatalogue.updateTermsAndConditions = sinon.stub().returns('123')

		await setTermsAndConditions(request, response)

		expect(termsAndConditionsFactory.create).to.have.been.calledWith(request.body)
		expect(termsAndConditionsValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(termsAndConditionsValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash).to.not.exist
		expect(learningCatalogue.updateTermsAndConditions).to.have.been.calledWith(
			learningProviderId,
			termsAndConditions
		)

		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}`
		)
	})

	it('should call delete terms and conditions and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const termsAndConditionsId = 'tc-123'

		const deleteTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.deleteTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = learningProviderId
		request.params.termsAndConditionsId = termsAndConditionsId

		learningCatalogue.deleteTermsAndConditions = sinon.stub()

		await deleteTermsAndConditions(request, response)

		expect(learningCatalogue.deleteTermsAndConditions).to.have.been.calledOnceWith(
			learningProviderId,
			termsAndConditionsId
		)
		expect(response.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}`
		)
	})
})
