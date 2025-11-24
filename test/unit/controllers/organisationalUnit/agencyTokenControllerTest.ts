import * as sinon from 'sinon'
const session = require('supertest-session')
import sinonChai = require('sinon-chai')
import * as chai from 'chai'
import {expect} from 'chai'
import {AgencyTokenService} from '../../../../src/lib/agencyTokenService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {AgencyTokenController} from '../../../../src/controllers/organisationalUnit/agencyTokenController'
import {createSubApp, getApp} from '../../../utils/testApp'
import {Domain} from '../../../../src/csrs/model/domain'
import {EditAgencyToken} from '../../../../src/controllers/organisationalUnit/model/editAgencyToken'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'

chai.use(sinonChai)

describe('AgencyTokenController', () => {
	let agencyTokenService = new AgencyTokenService()
	let organisationalUnitService: sinon.SinonStubbedInstance<OrganisationalUnitService> = sinon.createStubInstance(OrganisationalUnitService)
	let controller: AgencyTokenController = new AgencyTokenController(organisationalUnitService as any, agencyTokenService)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())
	const org = new OrganisationalUnit()
	org.id = 1
	org.domains = [new Domain(1, 'domain.com')]
	org.agencyToken = undefined
	organisationalUnitService.getOrganisation.withArgs("1").resolves(org)
	describe('View agency token', () => {
		it('should fetch the view agency token page when there is no token', async () => {
			const res = await session(app)
				.get('/content-management/organisations/1/agency-token')
				.set({"roles": 'ORGANISATION_MANAGER'}).send()
			expect(res.status).to.eql(200)
		})
		it('should fetch the view agency token page when there is a token', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			org.domains = [new Domain(1, 'domain.com')]
			org.agencyToken = new AgencyToken("uid", "token123", 10, 5, [new Domain(1, "domain.com")])
			organisationalUnitService.getOrganisation.withArgs("1").resolves(org)
			const res = await session(app)
				.get('/content-management/organisations/1/agency-token')
				.set({"roles": 'ORGANISATION_MANAGER'}).send()
			expect(res.status).to.eql(200)
		})
	})
	describe('Add agency domain', () => {
		const request = session(app)
			.post('/content-management/organisations/1/agency-token/domains')
			.set({"roles": 'ORGANISATION_MANAGER'})
		it('should add an agency domain', async () => {
			const body = {
				domain: ["domain.com"]
			}
			const res = await request.send(body)
			expect(res.status).to.eql(200)
		})
		describe("Existing token", () => {
			const subApp = createSubApp()
			const pageModel = new EditAgencyToken(1, true, ["domain.com"], 1, 0, "XYZ")
			subApp.all('*', (req, res, next) => {
				req.session!.agencyTokenPageModel = pageModel
				next()
			}).use(app)
			it('should validate adding an agency domain that already exists', async () => {
				const body = {
					domainToAdd: "domain.com"
				}
				const res = await session(subApp)
					.post('/content-management/organisations/1/agency-token/domains')
					.set({"roles": 'ORGANISATION_MANAGER'})
					.send(body)
				expect(res.status).to.eql(200)
				expect(res.text).to.contain('Domain already listed')
			})
			it('remove an an agency domain', async () => {
				const res = await session(subApp)
					.post('/content-management/organisations/1/agency-token/domains?domainToRemove=domain.com')
					.set({"roles": 'ORGANISATION_MANAGER'})
					.send({})
				expect(res.status).to.eql(200)
				expect(res.text).to.not.contain('domain.com')
			})
		})
	})
	describe('Create agency token', () => {
		const request = session(app)
			.post('/content-management/organisations/1/agency-token')
			.set({"roles": 'ORGANISATION_MANAGER'})
		it('should create an agency token', async () => {
			const body = {
				domain: ["domain.com"],
				capacity: 10,
				token: "ABC123"
			}
			const res = await request.send(body)
			expect(res.status).to.eql(302)
			expect(res['headers'].location).to.eql('/content-management/organisations/1/overview')
			expect(organisationalUnitService.createAgencyToken).to.have.been.calledOnce
		})
		describe('Validation', () => {
			it('should validate domains', async () => {
				const body = {
					domain: [],
					capacity: 10,
					token: "ABC123"
				}
				const res = await session(app)
					.post('/content-management/organisations/1/agency-token')
					.set({"roles": 'ORGANISATION_MANAGER'}).send(body)
				expect(res.text).to.contain('You must enter at least one domain')
				expect(res.status).to.eql(400)
			})
			it('should validate token number', async () => {
				const body = {
					domain: ['domain.com'],
					capacity: 10,
					token: "ABC###123"
				}
				const res = await session(app)
					.post('/content-management/organisations/1/agency-token')
					.set({"roles": 'ORGANISATION_MANAGER'}).send(body)
				expect(res.text).to.contain('Invalid token number format – please re-generate token number')
				expect(res.status).to.eql(400)
			})
			it('should validate capacity', async () => {
				const body = {
					domain: ['domain.com'],
					capacity: 0,
					token: "ABC123"
				}
				const res = await session(app)
					.post('/content-management/organisations/1/agency-token')
					.set({"roles": 'ORGANISATION_MANAGER'}).send(body)
				expect(res.text).to.contain('Enter a valid number of spaces')
				expect(res.status).to.eql(400)
			})
		})
	})
	describe('Edit agency token', () => {
		// Validation is identical to create and therefore covered with the above tests
		const request = session(app)
			.post('/content-management/organisations/1/agency-token/edit')
			.set({"roles": 'ORGANISATION_MANAGER'})
		it('should edit an agency token', async () => {
			const body = {
				domain: ["domain.com"],
				capacity: 10,
				token: "ABC123"
			}
			const res = await request.send(body)
			expect(res.status).to.eql(302)
			expect(res['headers'].location).to.eql('/content-management/organisations/1/overview')
			expect(organisationalUnitService.updateAgencyToken).to.have.been.calledOnce
		})
	})
	describe('Delete agency token', () => {
		it('should delete the agency token', async () => {
		const res = await session(app)
			.post('/content-management/organisations/1/agency-token/delete')
			.set({"roles": 'ORGANISATION_MANAGER'})
			.send()
			expect(res.status).to.eql(302)
			expect(res['headers'].location).to.eql('/content-management/organisations/1/overview')
			expect(organisationalUnitService.deleteAgencyToken).to.have.been.calledOnce
		})
	})
})
