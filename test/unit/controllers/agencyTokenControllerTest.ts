import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {Request, Response, NextFunction} from 'express'
import {describe} from 'mocha'
import {expect} from 'chai'
import {mockRes, mockReq} from 'sinon-express-mock'
import {AgencyToken} from '../../../src/csrs/model/agencyToken'
import {AgencyTokenController} from '../../../src/controllers/agencyTokenController'
import {AgencyTokenFactory} from '../../../src/csrs/model/agencyTokenFactory'
import {AgencyTokenService} from '../../../src/lib/agencyTokenService'
import {Csrs} from '../../../src/csrs'
import {OrganisationalUnit} from '../../../src/csrs/model/organisationalUnit'
import {OrganisationalUnitService} from '../../../src/csrs/service/organisationalUnitService'
import {Validator} from '../../../src/learning-catalogue/validator/validator'

chai.use(sinonChai)

describe('AgencyTokenController', () => {
	let req: Request
	let res: Response
	let next: NextFunction
	let error: Error
	let agencyTokenFactory: AgencyTokenFactory = <AgencyTokenFactory>{}
	let agencyTokenService: AgencyTokenService = <AgencyTokenService>{}
	let agencyTokenValidator: Validator<AgencyToken> = <Validator<AgencyToken>>{}
	let csrs: Csrs = <Csrs>{}
	let organisationalUnitService: OrganisationalUnitService = <OrganisationalUnitService>{}
	let agencyTokenController: AgencyTokenController = new AgencyTokenController(agencyTokenValidator, agencyTokenService, organisationalUnitService, agencyTokenFactory, csrs)

	const organisationId = 'organisation-id'
	const tokenNumber = 'ABCDEFG123'
	const capacity = '125'
	const domains = ['cabinetoffice.gov.uk', 'nhs.net']

	beforeEach(() => {
		req = mockReq()
		req.session!.save = callback => {
			callback(undefined)
		}

		res = mockRes()
		res.locals.organisationalUnit = new OrganisationalUnit()
		res.locals.organisationalUnit.id = organisationId

		next = sinon.stub()
		error = new Error()
	})

	describe('#addEditAgencyToken', () => {
		it('should render the Add/Edit Agency Token page', async function() {
			agencyTokenService.generateToken = sinon.stub().returns(tokenNumber)

			await agencyTokenController.addEditAgencyToken()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/organisation/add-edit-agency-token')
		})
	})

	describe('#redirectToAddEditAgencyTokenWithError', () => {
		it('should redirect to the Add/Edit Agency Token page with an error message', async function() {
			await agencyTokenController.redirectToAddEditAgencyTokenWithError(req, res, error)

			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/organisations/${organisationId}/agency-token`)
			expect(req.session!.sessionFlash).to.deep.equal({errors: error})
		})
	})

	describe('#createAgencyToken', () => {
		it('should create agency token for organisation and redirect to the Organisation Overview page if data submitted is valid', async function() {
			req.body = {capacity: capacity, tokenNumber: tokenNumber}
			req.session!.domainsForAgencyToken = domains

			agencyTokenValidator.check = sinon.stub().returns([])
			agencyTokenService.validateAgencyTokenNumber = sinon.stub().returns(true)
			agencyTokenService.validateDomains = sinon.stub().returns(true)

			const agencyToken = new AgencyToken()
			agencyTokenFactory.create = sinon.stub().returns(agencyToken)
			csrs.createAgencyToken = sinon.stub().returns(Promise.resolve())

			await agencyTokenController.createAgencyToken()(req, res, next)

			expect(csrs.createAgencyToken).to.have.been.calledOnceWith(organisationId, agencyToken)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/organisations/${organisationId}/overview`)
		})

		it('should update agency token for organisation and redirect to the Organisation Overview page if data submitted is valid', async function() {
			req.body = {capacity: capacity, tokenNumber: tokenNumber}
			req.session!.domainsForAgencyToken = domains

			agencyTokenValidator.check = sinon.stub().returns([])
			agencyTokenService.validateAgencyTokenNumber = sinon.stub().returns(true)
			agencyTokenService.validateDomains = sinon.stub().returns(true)

			const agencyToken: AgencyToken = new AgencyToken()

			agencyToken.capacityUsed = 11
			res.locals.organisationalUnit.agencyToken = agencyToken

			agencyTokenFactory.create = sinon.stub().returns(agencyToken)
			csrs.updateAgencyToken = sinon.stub().returns(Promise.resolve())

			await agencyTokenController.updateAgencyToken()(req, res, next)

			expect(csrs.updateAgencyToken).to.have.been.calledOnceWith(organisationId, agencyToken)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/organisations/${organisationId}/overview`)
		})

		it('should handle bad request and redirect to agency token screen when creating', async function() {
			req.body = {capacity: capacity, tokenNumber: tokenNumber}
			req.session!.domainsForAgencyToken = domains

			agencyTokenValidator.check = sinon.stub().returns([])
			agencyTokenService.validateAgencyTokenNumber = sinon.stub().returns(true)
			agencyTokenService.validateDomains = sinon.stub().returns(true)

			const error = {response: {status: 400, data:{capacity: "invalid"}}}

			const agencyToken = new AgencyToken()
			agencyTokenFactory.create = sinon.stub().returns(agencyToken)
			csrs.createAgencyToken = sinon.stub().returns(Promise.reject(error))

			await agencyTokenController.createAgencyToken()(req, res, next)
			expect(csrs.createAgencyToken).to.have.been.calledOnceWith(organisationId, agencyToken)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/organisations/${organisationId}/agency-token`)
		})

		it('should handle bad request and redirect to agency token screen when updating', async function() {
			req.body = {capacity: capacity, tokenNumber: tokenNumber}
			req.session!.domainsForAgencyToken = domains

			agencyTokenValidator.check = sinon.stub().returns([])
			agencyTokenService.validateAgencyTokenNumber = sinon.stub().returns(true)
			agencyTokenService.validateDomains = sinon.stub().returns(true)
			const agencyToken: AgencyToken = new AgencyToken()

			agencyToken.capacityUsed = 11
			res.locals.organisationalUnit.agencyToken = agencyToken
			const error = {response: {status: 400, data: {capacity: "invalid"}}}

			agencyTokenFactory.create = sinon.stub().returns(agencyToken)
			csrs.updateAgencyToken = sinon.stub().returns(Promise.reject(error))

			await agencyTokenController.updateAgencyToken()(req, res, next)
			expect(csrs.updateAgencyToken).to.have.been.calledOnceWith(organisationId, agencyToken)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/organisations/${organisationId}/agency-token`)
		})
	})
})
