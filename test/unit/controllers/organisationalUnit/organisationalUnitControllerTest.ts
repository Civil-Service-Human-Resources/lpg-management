import * as sinon from 'sinon'
const session = require('supertest-session')
import sinonChai = require('sinon-chai')
import * as chai from 'chai'
import {expect} from 'chai'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {getApp} from '../../../utils/testApp'
import {OrganisationController} from '../../../../src/controllers/organisationalUnit/organisationController'
import {OrganisationalUnitNode} from '../../../../src/csl-service/model/organisationalUnit/organisationalUnitNode'

chai.use(sinonChai)

describe('OrganisationalUnit', () => {
	let organisationalUnitService: sinon.SinonStubbedInstance<OrganisationalUnitService> = sinon.createStubInstance(OrganisationalUnitService)
	let controller: OrganisationController = new OrganisationController(organisationalUnitService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())
	const org = new OrganisationalUnit()
	org.name = "Organisation"
	org.code = "ORG"
	org.abbreviation = "ORGABBREV"
	org.parentName = "Parent"
	organisationalUnitService.getOrganisation.withArgs("1").resolves(org)

	organisationalUnitService.getOrgTree.resolves(
		[
			new OrganisationalUnitNode("org 1", 1, [
				new OrganisationalUnitNode("org 2", 2, [])
			]),
			new OrganisationalUnitNode("org 3", 3, [])])

	describe('Manage', () => {
		it('should render the organisational unit tree', async () => {
			const request = session(app)
				.get('/content-management/organisations/manage')
				.set({"roles": 'ORGANISATION_MANAGER'})
			const res = await request.send()
			expect(res.status).to.eql(200)
		})
	})
	describe('Overview', () => {
		it('should fetch the view organisation overview page', async () => {
			const request = session(app)
				.get('/content-management/organisations/1/overview')
				.set({"roles": 'ORGANISATION_MANAGER'})
			const res = await request.send()
			expect(res.status).to.eql(200)
		})
	})
	describe('Add organisational unit', () => {
		describe('Get', () => {
			it('should load the page correctly', async () => {
				const res = await session(app)
					.get('/content-management/organisations')
					.set({"roles": 'ORGANISATION_MANAGER'})
					.send()
				expect(res.status).to.eql(200)
			})
		})
		describe('Create', () => {
			it('should add a new organisation', async () => {
				const org = new OrganisationalUnit()
				org.name = "Organisation 2"
				org.code = "ORG"
				org.id = 2
				organisationalUnitService.createOrganisationalUnit.resolves(org)
				const body = {
					name: "Organisation 2",
					code: "ORG"
				}
				const request = session(app)
					.post('/content-management/organisations/')
					.set({"roles": 'ORGANISATION_MANAGER'})
				const res = await request.send(body)
				expect(res.status).to.eql(302)
				expect(res['headers'].location).to.eql('/content-management/organisations/2/overview')
				expect(organisationalUnitService.createOrganisationalUnit).to.be.calledOnce
			})
			describe('validation', () => {
				it('should validate missing properties', async () => {
					const body = { }
					const request = session(app)
						.post('/content-management/organisations/')
						.set({"roles": 'ORGANISATION_MANAGER'})
					const res = await request.send(body)
					expect(res.status).to.eql(400)
					expect(res.text).to.contain('Organisation name is required')
					expect(res.text).to.contain('Organisation code is required')
				})
			})
		})

	})
})
