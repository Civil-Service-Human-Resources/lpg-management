import {getApp} from '../../../utils/testApp'
import {
	OrganisationalUnitDomainsController
} from '../../../../src/controllers/organisationalUnit/organisationalUnitDomainsController'
import * as sinon from 'sinon'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {Domain} from '../../../../src/csrs/model/domain'
import * as request from 'supertest'
import {expect} from 'chai'

describe('organisationalUnitDomainsController tests', () => {
	let organisationalUnitService: sinon.SinonStubbedInstance<OrganisationalUnitService> = sinon.createStubInstance(OrganisationalUnitService)
	const controller: OrganisationalUnitDomainsController = new OrganisationalUnitDomainsController(organisationalUnitService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())
	describe('Add new domain to organisation tests', () => {
		const org = new OrganisationalUnit()
		org.id = 1
		org.domains = [new Domain(1, 'domain.com')]
		organisationalUnitService.getOrganisation.withArgs("1").resolves(org)
		describe('Validation tests', () => {
			it('should return a 400 error when an attempting to add an existing domain', async () => {
				const res = await request(app)
					.post('/content-management/organisations/1/domains')
					.set({"roles": 'ORGANISATION_MANAGER'})
					.send({domainToAdd: 'domain.com'})

				expect(res.status).to.eql(400)
				expect(res.text).to.contain('Domain already listed')
			})
			it('should return a 400 error when an attempting to add an empty domain', async () => {
				const res = await request(app)
					.post('/content-management/organisations/1/domains')
					.set({"roles": 'ORGANISATION_MANAGER'})
					.send({domainToAdd: ''})

				expect(res.status).to.eql(400)
				expect(res.text).to.contain('Domain is required')
			})
			it('should return a 400 error when an attempting to add an invalid domain', async () => {
				const res = await request(app)
					.post('/content-management/organisations/1/domains')
					.set({"roles": 'ORGANISATION_MANAGER'})
					.send({domainToAdd: 'd'})

				expect(res.status).to.eql(400)
				expect(res.text).to.contain(`Enter domain in the correct format`)
			})
		})
		it('should return a 401 error when an attempting to add a domain with the incorrect role', async () => {
			const res = await request(app)
				.post('/content-management/organisations/1/domains')
				.set({"roles": 'ORGANISATION_MANAGE'})
				.send({domainToAdd: 'domain.com'})

			expect(res.status).to.eql(401)
			expect(res.text).to.contain('Sorry, you don\'t have permission to access this page')
		})
	})
})
