import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'
import { OrganisationalUnitPageModel } from '../../../../src/csrs/model/organisationalUnitPageModel'
import {OrganisationalUnitClient} from '../../../../src/csrs/client/organisationalUnitClient'
import {EditAgencyToken} from '../../../../src/controllers/organisationalUnit/model/editAgencyToken'
import {OrganisationalUnitCacheManager} from '../../../../src/csrs/organisationalUnitCacheManager'
import { Domain } from '../../../../src/csrs/model/domain'

chai.use(sinonChai)


describe('OrganisationalUnitService tests', () => {
	let organisationalUnitCacheManager: sinon.SinonStubbedInstance<OrganisationalUnitCacheManager>
	let organisationalUnitClient: sinon.SinonStubbedInstance<OrganisationalUnitClient>
	let organisationalUnitService: OrganisationalUnitService

	beforeEach(() => {
		organisationalUnitCacheManager = sinon.createStubInstance(OrganisationalUnitCacheManager)
		organisationalUnitClient = sinon.createStubInstance(OrganisationalUnitClient)
		organisationalUnitService = new OrganisationalUnitService(
			organisationalUnitCacheManager as any,
			organisationalUnitClient as any
		)
	})

	describe('getOrganisation tests', () => {
		it('should get organisationalUnit with cache hit', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1

			organisationalUnitCacheManager.get.withArgs(1).resolves(organisationalUnit)
			const result = await organisationalUnitService.getOrganisation(1)

			expect(result).to.eql(organisationalUnit)
		})

		it('should get organisationalUnit and agency token with cache hit', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1

			organisationalUnit.agencyToken = new AgencyToken('agencyUID', 'token', 10, 5 ,[
				new Domain(1, 'domain.com')
			])

			organisationalUnitCacheManager.get.withArgs(1).resolves(organisationalUnit)
			const result = await organisationalUnitService.getOrganisation(1)

			expect(result.id).to.eql(1)
			expect(result.agencyToken!.capacityUsed).to.eql(5)
			expect(result.agencyToken!.uid).to.eql('agencyUID')
		})

		it('should get organisationalUnit and set the cache on cache miss', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1

			organisationalUnitClient.get.withArgs(1).resolves(organisationalUnit)
			organisationalUnitCacheManager.get.withArgs(1).resolves(undefined)
			const result = await organisationalUnitService.getOrganisation(1)

			expect(organisationalUnitCacheManager.get).to.be.calledOnce
			expect(result.id).to.eql(1)
		})

	})

	describe('organisationalUnit CRUD tests', () => {
		it('Should create a new organisational unit and set the cache', async () => {
			const model = new OrganisationalUnitPageModel("org", "ORG", "O", null)
			const org = new OrganisationalUnit()
			org.id = 1
			organisationalUnitClient.create.withArgs(model).resolves(org)
			const newOrg = await organisationalUnitService.createOrganisationalUnit(model)
			expect(newOrg).to.eql(org)
			expect(organisationalUnitClient.create).to.be.calledOnce
			expect(organisationalUnitCacheManager.updateAndRefresh).to.be.calledOnce
		})

		it('Should update an organisational unit and set the cache', async () => {
			const model = new OrganisationalUnitPageModel("org", "ORG", "O", null)
			const org = new OrganisationalUnit()
			org.id = 1
			organisationalUnitClient.update.withArgs(org.id, model).resolves(org)
			await organisationalUnitService.updateOrganisationalUnit(org, model)
			expect(organisationalUnitClient.update).to.be.calledWith(org.id, model)
			expect(organisationalUnitCacheManager.updateAndRefresh).to.be.calledOnce
		})

		it('Should delete an organisational unit and set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			organisationalUnitClient.delete.withArgs(org.id).resolves({deletedIds: [1,2,3,4,5]})
			await organisationalUnitService.deleteOrganisationalUnit(1)
			expect(organisationalUnitCacheManager.deleteAndRefresh).callCount(1)
			expect(organisationalUnitClient.delete).to.be.calledWith(1)
		})

		it('Should create an agency token set the cache', async () => {
			const token = new EditAgencyToken(1, true, ["domain.com"], 10, 0, 'abc')
			await organisationalUnitService.createAgencyToken(1, token)
			expect(organisationalUnitClient.createAgencyToken).to.be.calledWith(1, token)
			expect(organisationalUnitCacheManager.update).to.be.calledOnce
		})

		it('Should delete an agency token set the cache', async () => {
			await organisationalUnitService.deleteAgencyToken(new OrganisationalUnit())
			expect(organisationalUnitCacheManager.update).to.be.calledOnce
		})
	})

})
