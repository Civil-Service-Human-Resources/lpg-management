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

	let req: Request
	let res: Response

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		termsAndConditionsFactory = <TermsAndConditionsFactory>{}
		termsAndConditionsValidator = <Validator<TermsAndConditions>>{}

		termsAndConditionsController = new TermsAndConditionsController(
			learningCatalogue,
			termsAndConditionsFactory,
			termsAndConditionsValidator
		)

		req = mockReq()
		res = mockRes()

		req.session!.save = callback => {
			callback(undefined)
		}
	})

	it('should call get terms and conditions page ', async function() {
		const getTermsAndConditions: (
			request: Request,
			response: Response
		) => void = termsAndConditionsController.getTermsAndConditions()

		await getTermsAndConditions(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/learning-provider/terms-and-conditions')
	})

	it('should redirect to terms and conditions page and render errors', async function() {
		const learningProviderId = 'lp-123'

		req.body = {name: ''}
		req.params.learningProviderId = learningProviderId
		const termsAndConditions = new TermsAndConditions()
		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)

		const errors = {fields: ['validation.terms.and.conditions.policy.title.empty'], size: 1}

		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		await termsAndConditionsController.createTermsAndConditions()(req, res)

		expect(termsAndConditionsValidator.check).to.have.been.calledWith(req.body, ['name', 'content'])
		expect(termsAndConditionsValidator.check).to.have.returned(errors)

		expect(res.redirect).to.have.been.calledOnceWith(
			`/content-management/learning-providers/${learningProviderId}/terms-and-conditions/`
		)
	})

	it('should call create terms and conditions, create and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'

		req.body = {name: ''}
		req.params.learningProviderId = learningProviderId
		const termsAndConditions = new TermsAndConditions()
		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)

		learningCatalogue.createTermsAndConditions = sinon.stub().returns('123')

		const errors = {fields: [], size: 0}
		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		await termsAndConditionsController.createTermsAndConditions()(req, res)

		expect(termsAndConditionsFactory.create).to.have.been.calledWith(req.body)
		expect(termsAndConditionsValidator.check).to.have.been.calledWith(req.body, ['name', 'content'])
		expect(termsAndConditionsValidator.check).to.have.returned(errors)
		expect(learningCatalogue.createTermsAndConditions).to.have.been.calledWith(
			learningProviderId,
			termsAndConditions
		)

		expect(res.redirect).to.have.been.calledOnceWith(`/content-management/learning-providers/${learningProviderId}`)
	})

	it('should call update terms and conditions, edit and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const termsAndConditionsId = 'tc-123'

		req.body = {name: ''}
		req.params.learningProviderId = learningProviderId
		req.params.termsAndConditionsId = termsAndConditionsId

		const termsAndConditions = new TermsAndConditions()
		termsAndConditions.id = termsAndConditionsId
		termsAndConditionsFactory.create = sinon.stub().returns(termsAndConditions)
		res.locals.termsAndConditions = termsAndConditions

		const errors = {fields: [], size: 0}
		termsAndConditionsValidator.check = sinon.stub().returns(errors)

		learningCatalogue.updateTermsAndConditions = sinon.stub().returns('123')

		await termsAndConditionsController.updateTermsAndConditions()(req, res)

		expect(termsAndConditionsValidator.check).to.have.been.calledWith(req.body, ['name', 'content'])
		expect(termsAndConditionsValidator.check).to.have.returned(errors)
		expect(learningCatalogue.updateTermsAndConditions).to.have.been.calledWith(
			learningProviderId,
			termsAndConditions
		)

		expect(res.redirect).to.have.been.calledOnceWith(`/content-management/learning-providers/${learningProviderId}`)
	})

	it('should call delete terms and conditions and redirect successfully if no errors', async function() {
		const learningProviderId = 'lp-123'
		const termsAndConditionsId = 'tc-123'

		req.params.learningProviderId = learningProviderId
		req.params.termsAndConditionsId = termsAndConditionsId

		learningCatalogue.deleteTermsAndConditions = sinon.stub()

		await termsAndConditionsController.deleteTermsAndConditions()(req, res)

		expect(learningCatalogue.deleteTermsAndConditions).to.have.been.calledOnceWith(
			learningProviderId,
			termsAndConditionsId
		)
		expect(res.redirect).to.have.been.calledOnceWith(`/content-management/learning-providers/${learningProviderId}`)
	})
})
