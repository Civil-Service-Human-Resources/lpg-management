import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import * as sinon from 'sinon'
import {AudienceController} from '../../../../src/controllers/audience/audienceController'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {Audience} from '../../../../src/learning-catalogue/model/audience'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {AudienceFactory} from '../../../../src/learning-catalogue/model/factory/audienceFactory'
import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {Course} from '../../../../src/learning-catalogue/model/course'

chai.use(sinonChai)

describe('Audience Controller Tests', function() {
	let audienceController: AudienceController
	let learningCatalogue: LearningCatalogue
	let audienceValidator: Validator<Audience>
	let audienceFactory: AudienceFactory
	let csrsService: CsrsService

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		audienceValidator = <Validator<Audience>>{}
		audienceFactory = <AudienceFactory>{}
		csrsService = <CsrsService>{}

		audienceController = new AudienceController(learningCatalogue, audienceValidator, audienceFactory, csrsService)
	})

	it('should call get audience name page', async function() {
		const audienceName: (request: Request, response: Response) => void = audienceController.getAudienceName()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const course = new Course()
		course.modules = []
		response.locals.course = course

		await audienceName(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/audience/audience-name')
	})

	it('should call get audience type page', async function() {
		const getAudienceType: (request: Request, response: Response) => void = audienceController.getAudienceType()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const course = new Course()
		course.modules = []
		response.locals.course = course

		await getAudienceType(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/audience/audience-type')
	})

	it('should call get configure audience page', async function() {
		const getConfigureAudience: (
			request: Request,
			response: Response
		) => void = audienceController.getConfigureAudience()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const course = new Course()
		course.modules = []
		response.locals.course = course

		await getConfigureAudience(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/audience/configure-audience')
	})

	it('should call audience organisation page', async function() {
		const audienceOrganisations: (
			request: Request,
			response: Response
		) => void = audienceController.getOrganisation()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const organisations = [
			{
				code: 'co',
				name: 'Cabinet Office',
			},
			{
				code: 'dh',
				name: 'Department of Health & Social Care',
			},
		]
		csrsService.getOrganisations = sinon.stub().returns(organisations)

		const course = new Course()
		course.modules = []

		response.locals.course = course

		await audienceOrganisations(request, response)

		expect(csrsService.getOrganisations).to.have.been.called
		expect(response.render).to.have.been.calledOnceWith('page/course/audience/add-organisation', {organisations})
	})

	it('should call set audience organisation page', async function() {
		const setAudienceOrganisation: (
			request: Request,
			response: Response
		) => void = audienceController.setOrganisation()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const course = new Course()
		course.modules = []
		response.locals.course = course

		await setAudienceOrganisation(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/audience/configure-audience')
	})
})
