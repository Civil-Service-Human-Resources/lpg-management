import {mockReq, mockRes} from 'sinon-express-mock'
import {Request, Response} from 'express'
import {expect} from 'chai'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {beforeEach, describe, it} from 'mocha'
import {TermsAndConditionsController} from '../../../src/controllers/LearningProvider/termsAndConditionsController'
import {TermsAndConditionsValidator} from '../../../src/learning-catalogue/validator/termsAndConditionsValidator'
import {TermsAndConditionsFactory} from '../../../src/learning-catalogue/model/factory/termsAndConditionsFactory'
import {LearningProvider} from '../../../src/learning-catalogue/model/learningProvider'
import {TermsAndConditions} from '../../../src/learning-catalogue/model/termsAndConditions'

chai.use(sinonChai)

describe('Terms and Conditions Controller Test', function() {
	let termsAndConditionsController: TermsAndConditionsController
	let learningCatalogue: LearningCatalogue
	let termsAndConditionsValidator: TermsAndConditionsValidator
	let termsAndConditionsFactory: TermsAndConditionsFactory

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		termsAndConditionsValidator = <TermsAndConditionsValidator>{}
		termsAndConditionsFactory = <TermsAndConditionsFactory>{}

		termsAndConditionsController = new TermsAndConditionsController(
			learningCatalogue,
			termsAndConditionsValidator,
			termsAndConditionsFactory
		)
	})

	it('should render add-terms-and-conditions page', async function() {
		const getTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.getTermsAndConditions(false)

		const request: Request = mockReq()
		const response: Response = mockRes()

		const learningProvider: LearningProvider = new LearningProvider()

		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		await getTermsAndConditions(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/add-terms-and-conditions', {learningProvider})
	})

	it('should check for errors and redirect to learning-provider page', async function() {
		const setTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.setTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'

		request.body = {name: 'Updated Title', content: 'Terms and conditions'}

		termsAndConditionsValidator.check = sinon.stub().returns({fields: [], size: 0})

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const termsAndConditions: TermsAndConditions = new TermsAndConditions()
		learningCatalogue.createTermsAndConditions = sinon.stub().returns(termsAndConditions)

		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)

		await setTermsAndConditions(request, response)

		expect(termsAndConditionsValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(learningCatalogue.createTermsAndConditions).to.have.been.calledWith('abc', termsAndConditions)
		expect(response.redirect).to.have.been.calledOnceWith('/content-management/learning-providers/abc')
	})

	it('should check for errors and render add-terms-and-conditions page', async function() {
		const setTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.setTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'

		request.body = {name: 'Updated Title', content: 'Terms and conditions'}

		const errors = {fields: ['validation.termsAndConditions.title.empty'], size: 1}

		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const termsAndConditions: TermsAndConditions = new TermsAndConditions()

		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)

		await setTermsAndConditions(request, response)

		expect(termsAndConditionsValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(response.render).to.have.been.calledOnceWith('page/add-terms-and-conditions', {
			errors: errors,
			learningProvider: learningProvider,
			termsAndConditions: termsAndConditions,
		})
	})

	it('should check for errors and redirect to learning-provider page', async function() {
		const updateTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.updateTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'
		request.params.termsAndConditionsId = 'cba'

		request.body = {name: 'Updated Title', content: 'Terms and Conditions'}

		termsAndConditionsValidator.check = sinon.stub().returns({fields: [], size: 0})

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const termsAndConditions: TermsAndConditions = new TermsAndConditions()
		learningCatalogue.getTermsAndConditions = sinon.stub().returns(termsAndConditions)

		learningCatalogue.updateTermsAndConditions = sinon.stub().returns(null)

		await updateTermsAndConditions(request, response)

		expect(termsAndConditionsValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(learningCatalogue.getTermsAndConditions).to.have.been.calledWith('abc', 'cba')
		expect(learningCatalogue.updateTermsAndConditions).to.have.been.calledWith('abc', 'cba', termsAndConditions)
		expect(response.redirect).to.have.been.calledWith('/content-management/learning-providers/abc')
	})

	it('should check for errors in update and render to add-terms-and-conditions page', async function() {
		const updateTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.updateTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'
		request.params.termsAndConditionsId = 'cba'

		request.body = {name: 'Updated Title', content: 'Terms and Conditions'}

		const errors = {fields: ['validation.termsAndConditions.title.empty'], size: 1}
		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		const learningProvider: LearningProvider = new LearningProvider()
		learningCatalogue.getLearningProvider = sinon.stub().returns(learningProvider)

		const termsAndConditions: TermsAndConditions = new TermsAndConditions()
		learningCatalogue.getTermsAndConditions = sinon.stub().returns(termsAndConditions)

		await updateTermsAndConditions(request, response)

		expect(termsAndConditionsValidator.check).to.have.been.calledWith(request.body)
		expect(learningCatalogue.getLearningProvider).to.have.been.calledWith('abc')
		expect(learningCatalogue.getTermsAndConditions).to.have.been.calledWith('abc', 'cba')
		expect(response.render).to.have.been.calledOnceWith('page/add-terms-and-conditions', {
			errors: errors,
			learningProvider: learningProvider,
			termsAndConditions: termsAndConditions,
			isEdit: true,
		})
	})

	it('should delete terms and conditions and redirect to learning-providers page', async function() {
		const deleteTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.deleteTermsAndConditions()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.learningProviderId = 'abc'
		request.params.termsAndConditionsId = 'cba'

		learningCatalogue.deleteTermsAndConditions = sinon.stub()

		await deleteTermsAndConditions(request, response)

		expect(learningCatalogue.deleteTermsAndConditions).to.have.been.calledWith('abc', 'cba')
		expect(response.redirect).to.have.been.calledWith('/content-management/learning-providers/abc')
	})
})
