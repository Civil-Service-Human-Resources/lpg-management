import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'
import {OrganisationalUnitClient} from '../../../../src/csrs/client/organisationalUnitClient'
import {OrganisationalUnitCache} from '../../../../src/csrs/organisationalUnitCache'
import {AgencyTokenCapacityUsedHttpService} from '../../../../src/identity/agencyTokenCapacityUsedHttpService'
import {OrganisationalUnitTypeaheadCache} from '../../../../src/csrs/organisationalUnitTypeaheadCache'
import { OrganisationalUnitTypeAhead } from '../../../../src/csrs/model/organisationalUnitTypeAhead'
import { OrganisationalUnitPageModel } from '../../../../src/csrs/model/organisationalUnitPageModel'
import { getOrg } from '../utils'

chai.use(sinonChai)


describe('OrganisationalUnitService tests', () => {
	const organisationalUnitClient = sinon.createStubInstance(OrganisationalUnitClient)
	const organisationalUnitCache = sinon.createStubInstance(OrganisationalUnitCache)
	const organisationalUnitTypeaheadCache = sinon.createStubInstance(OrganisationalUnitTypeaheadCache)
	const agencyTokenCapacityUsedService = sinon.createStubInstance(AgencyTokenCapacityUsedHttpService)
	let organisationalUnitService: OrganisationalUnitService

	beforeEach(() => {
		sinon.reset()
		organisationalUnitService = new OrganisationalUnitService(
			organisationalUnitCache as any,
			organisationalUnitTypeaheadCache as any,
			organisationalUnitClient as any,
			agencyTokenCapacityUsedService as any
		)
	})

	describe('getOrganisation tests', () => {
		it('should get organisationalUnit with cache hit', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1

			organisationalUnitCache.get.withArgs(1).resolves(organisationalUnit)
			const result = await organisationalUnitService.getOrganisation(1)

			expect(result).to.eql(organisationalUnit)
		})

		it('should get organisationalUnit and parent with cache hit', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1
			organisationalUnit.parentId = 2

			const parentOrganisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			parentOrganisationalUnit.id = 2

			organisationalUnitCache.get.withArgs(1).resolves(organisationalUnit)
			organisationalUnitCache.get.withArgs(2).resolves(parentOrganisationalUnit)
			const result = await organisationalUnitService.getOrganisation(1, true)

			expect(result).to.eql(organisationalUnit)
			expect(result.parent!).to.eql(parentOrganisationalUnit)
		})

		it('should get organisationalUnit and agency token with cache hit', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1

			const agencyToken = new AgencyToken()
			agencyToken.uid = 'agencyUID'
			organisationalUnit.agencyToken = agencyToken

			organisationalUnitCache.get.withArgs(1).resolves(organisationalUnit)
			agencyTokenCapacityUsedService.getCapacityUsed.withArgs(agencyToken.uid).resolves(10)
			const result = await organisationalUnitService.getOrganisation(1, true)

			expect(result.id).to.eql(1)
			expect(result.agencyToken!.capacityUsed).to.eql(10)
			expect(result.agencyToken!.uid).to.eql('agencyUID')
		})

		it('should get organisationalUnit and set the cache on cache miss', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1

			organisationalUnitClient.getOrganisationalUnit.withArgs(1, {includeParents: false}).resolves(organisationalUnit)

			organisationalUnitCache.get.withArgs(1).resolves(undefined)
			const result = await organisationalUnitService.getOrganisation(1)

			expect(organisationalUnitCache.set).to.be.calledOnceWith(1, organisationalUnit)
			expect(result.id).to.eql(1)
		})

		it('should get organisationalUnit and set the cache on cache miss, as well as set parents', async () => {
			const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1

			const parentOrganisationalUnit: OrganisationalUnit = new OrganisationalUnit()
			parentOrganisationalUnit.id = 2

			organisationalUnit.parentId = 2
			organisationalUnit.parent = parentOrganisationalUnit

			organisationalUnitClient.getOrganisationalUnit.withArgs(1, {includeParents: true}).resolves(organisationalUnit)

			organisationalUnitCache.get.withArgs(1).resolves(undefined)
			const result = await organisationalUnitService.getOrganisation(1, true)

			expect(organisationalUnitCache.set).to.be.calledWith(1, organisationalUnit)
			expect(organisationalUnitCache.set).to.be.calledWith(2, parentOrganisationalUnit)
			expect(result.id).to.eql(1)
			expect(result.parent!.id).to.eql(2)
			expect(result.parent).to.eql(parentOrganisationalUnit)
		})
	})

	describe('organisationalUnit CRUD tests', () => {
		it('Should create a new organisational unit and set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			organisationalUnitClient.create.withArgs(org).resolves(org)
			organisationalUnitClient.getOrganisationalUnit.withArgs(org.id).resolves(org)
			const typeahead = new OrganisationalUnitTypeAhead([org])
			organisationalUnitTypeaheadCache.getTypeahead.resolves(typeahead)
			const newOrg = await organisationalUnitService.createOrganisationalUnit(org)
			expect(newOrg).to.eql(org)
			expect(organisationalUnitCache.set).to.be.calledWith(1, org)
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.calledWith(typeahead)
		})

		it('Should update an organisational unit and set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			const pageModel = new OrganisationalUnitPageModel()
			organisationalUnitClient.getOrganisationalUnit.withArgs(org.id).resolves(org)
			const typeahead = new OrganisationalUnitTypeAhead([org])
			organisationalUnitTypeaheadCache.getTypeahead.resolves(typeahead)
			await organisationalUnitService.updateOrganisationalUnit(org.id, pageModel)
			expect(organisationalUnitClient.update).to.be.calledWith(org.id, pageModel)
			expect(organisationalUnitCache.set).to.be.calledWith(1, org)
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.calledWith(typeahead)
		})

		it('Should create an agency token set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			const agencyToken = new AgencyToken()
			org.agencyToken = agencyToken
			const typeahead = new OrganisationalUnitTypeAhead([org])
			organisationalUnitClient.getOrganisationalUnit.withArgs(org.id).resolves(org)
			organisationalUnitTypeaheadCache.getTypeahead.resolves(typeahead)
			await organisationalUnitService.updateAgencyToken(org.id, agencyToken)
			expect(organisationalUnitClient.updateAgencyToken).to.be.calledWith(org.id, agencyToken)
			expect(organisationalUnitCache.set).to.be.calledWith(1, org)
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.calledWith(typeahead)
		})

		it('Should delete an agency token set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			const agencyToken = new AgencyToken()
			org.agencyToken = agencyToken
			const typeahead = new OrganisationalUnitTypeAhead([org])
			organisationalUnitClient.getOrganisationalUnit.withArgs(org.id).resolves(org)
			organisationalUnitTypeaheadCache.getTypeahead.resolves(typeahead)
			await organisationalUnitService.deleteAgencyToken(org.id)
			expect(organisationalUnitClient.deleteAgencyToken).to.be.calledWith(org.id)
			expect(organisationalUnitCache.set).to.be.calledWith(1, org)
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.calledWith(typeahead)
		})
	})

	describe('getOrgHierarchy tests', () => {
		it('Should return the correct hierarchy when all orgs exist in the cache', async () => {
			const grandparent = getOrg('Grandparent', 'Grandparent', 1)
			const child = getOrg('Child', 'Child', 3, 2)
			const parent = getOrg('Parent', 'Parent', 2, 1)

			organisationalUnitCache.get.withArgs(1).resolves(grandparent)
			organisationalUnitCache.get.withArgs(2).resolves(parent)
			organisationalUnitCache.get.withArgs(3).resolves(child)

			const hierarchy = await organisationalUnitService.getOrgHierarchy(3)
			expect(hierarchy.map((o) => o.name)).to.eql(['Child', 'Parent', 'Grandparent'])
		})
		it('Should return the correct hierarchy when no orgs exist in the cache', async () => {
			const grandparent = getOrg('Grandparent', 'Grandparent', 1)
			const child = getOrg('Child', 'Child', 3, 2)
			const parent = getOrg('Parent', 'Parent', 2, 1)
			parent.parent = grandparent
			child.parent = parent

			organisationalUnitCache.get.withArgs(3).resolves(undefined)
			organisationalUnitClient.getOrganisationalUnit
				.withArgs(3, {includeParents: true})
				.resolves(child)

			const hierarchy = await organisationalUnitService.getOrgHierarchy(3)
			expect(hierarchy.map((o) => o.name)).to.eql(['Child', 'Parent', 'Grandparent'])
		})
		it('Should return the correct hierarchy when there are mixed orgs in the cache', async () => {
			const grandparent = getOrg('Grandparent', 'Grandparent', 1)
			const child = getOrg('Child', 'Child', 3, 2)
			const parent = getOrg('Parent', 'Parent', 2, 1)
			parent.parent = grandparent

			organisationalUnitCache.get.withArgs(3).resolves(child)
			organisationalUnitClient.getOrganisationalUnit
				.withArgs(2, {includeParents: true})
				.resolves(child)

			const hierarchy = await organisationalUnitService.getOrgHierarchy(3)
			expect(hierarchy.map((o) => o.name)).to.eql(['Child', 'Parent', 'Grandparent'])
		})
	})
})
