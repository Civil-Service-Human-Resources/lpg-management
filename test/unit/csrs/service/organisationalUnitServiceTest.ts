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
import { OrganisationalUnitPageModel } from '../../../../src/csrs/model/organisationalUnitPageModel'
import { getOrg } from '../utils'
import { OrganisationalUnitTypeAhead } from '../../../../src/csrs/model/organisationalUnitTypeAhead'
import { AgencyTokenCapacityUsed } from '../../../../src/identity/model/AgencyTokenCapacityUsed'

chai.use(sinonChai)


describe('OrganisationalUnitService tests', () => {
	let organisationalUnitClient: sinon.SinonStubbedInstance<OrganisationalUnitClient>
	let organisationalUnitCache: sinon.SinonStubbedInstance<OrganisationalUnitCache>
	let organisationalUnitTypeaheadCache: sinon.SinonStubbedInstance<OrganisationalUnitTypeaheadCache>
	let agencyTokenCapacityUsedService: sinon.SinonStubbedInstance<AgencyTokenCapacityUsedHttpService>
	let organisationalUnitService: OrganisationalUnitService

	beforeEach(() => {
		organisationalUnitClient = sinon.createStubInstance(OrganisationalUnitClient)
		organisationalUnitCache = sinon.createStubInstance(OrganisationalUnitCache)
		organisationalUnitTypeaheadCache = sinon.createStubInstance(OrganisationalUnitTypeaheadCache)
		agencyTokenCapacityUsedService = sinon.createStubInstance(AgencyTokenCapacityUsedHttpService)
		organisationalUnitService = new OrganisationalUnitService(
			organisationalUnitCache as any,
			organisationalUnitTypeaheadCache as any,
			organisationalUnitClient as any,
			agencyTokenCapacityUsedService as any
		)
		organisationalUnitCache.setMultiple.returns([])
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
			const capacityUsed = new AgencyTokenCapacityUsed()
			capacityUsed.capacityUsed = '10'
			agencyTokenCapacityUsedService.getCapacityUsed.withArgs(agencyToken.uid).resolves(capacityUsed)
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

			expect(organisationalUnitCache.setMultiple).to.be.calledOnce
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

			expect(organisationalUnitCache.setMultiple).to.be.calledOnce
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
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead([org]))
			const newOrg = await organisationalUnitService.createOrganisationalUnit(org)
			expect(newOrg).to.eql(org)
			expect(organisationalUnitCache.setMultiple).to.be.calledOnce
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.called
		})

		it('Should update an organisational unit and set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			const pageModel = new OrganisationalUnitPageModel()
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead([org]))
			organisationalUnitClient.getOrganisationalUnit.withArgs(org.id).resolves(org)
			await organisationalUnitService.updateOrganisationalUnit(org.id, pageModel)
			expect(organisationalUnitClient.update).to.be.calledWith(org.id, pageModel)
			org.updateWithPageModel(pageModel)
			org.formattedName = undefined
			expect(organisationalUnitCache.setMultiple).to.be.calledTwice
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.called
		})

		it('Should delete an organisational unit and set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead([org]))
			await organisationalUnitService.deleteOrganisationalUnit(1)
			expect(organisationalUnitCache.delete).to.be.calledWith(1)
			expect(organisationalUnitClient.delete).to.be.calledWith(1)
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.called
		})

		it('Should delete an organisational unit (as well as children) and set the cache', async () => {
			const parent = new OrganisationalUnit()
			parent.id = 1
			const child = new OrganisationalUnit()
			child.id = 2
			child.parentId = 1
			const sibling = new OrganisationalUnit()
			sibling.id = 3
			sibling.parentId = 1
			const parent2 = new OrganisationalUnit()
			parent2.name = "parent2"
			parent2.id = 4
			const typeahead = [parent, child, sibling, parent2]
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead(typeahead))
			await organisationalUnitService.deleteOrganisationalUnit(1)
			expect(organisationalUnitCache.delete).to.be.calledWith(1)
			expect(organisationalUnitCache.delete).to.be.calledWith(2)
			expect(organisationalUnitCache.delete).to.be.calledWith(3)
			expect(organisationalUnitClient.delete).to.be.calledWith(1)
			const call = organisationalUnitTypeaheadCache.setTypeahead.firstCall
			const calledTypeahead: OrganisationalUnitTypeAhead = call.args[0]
			expect(calledTypeahead.typeahead.length).to.eql(1)
			expect(calledTypeahead.typeahead[0].name).to.eql("parent2")
		})

		it('Should create an agency token set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			const agencyToken = new AgencyToken()
			org.agencyToken = agencyToken
			const capacityUsed = new AgencyTokenCapacityUsed()
			capacityUsed.capacityUsed = '10'
			agencyTokenCapacityUsedService.getCapacityUsed.withArgs(agencyToken.uid).resolves(capacityUsed)
			organisationalUnitCache.get.withArgs(1).resolves(org)
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead([org]))
			await organisationalUnitService.createAgencyToken(org.id, agencyToken)
			expect(organisationalUnitClient.createAgencyToken).to.be.calledWith(org.id, agencyToken)
			expect(organisationalUnitCache.setMultiple).to.be.calledOnce
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.called
		})

		it('Should delete an agency token set the cache', async () => {
			const org = new OrganisationalUnit()
			org.id = 1
			const agencyToken = new AgencyToken()
			org.agencyToken = agencyToken
			const capacityUsed = new AgencyTokenCapacityUsed()
			capacityUsed.capacityUsed = '10'
			agencyTokenCapacityUsedService.getCapacityUsed.withArgs(agencyToken.uid).resolves(capacityUsed)
			organisationalUnitCache.get.withArgs(1).resolves(org)
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead([org]))
			await organisationalUnitService.deleteAgencyToken(org.id)
			expect(organisationalUnitClient.deleteAgencyToken).to.be.calledWith(org.id)
			expect(organisationalUnitCache.setMultiple).to.be.calledOnce
			expect(organisationalUnitTypeaheadCache.setTypeahead).to.be.called
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
				.resolves(parent)

			const hierarchy = await organisationalUnitService.getOrgHierarchy(3)
			expect(hierarchy.map((o) => o.name)).to.eql(['Child', 'Parent', 'Grandparent'])
		})
	})

	describe('addDomain tests', () => {
		it('Add the domain to the organisation', async () => {
			const org = getOrg('Grandparent', 'Grandparent', 1)
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead([org]))
			organisationalUnitCache.get.withArgs(1).resolves(org)
			organisationalUnitClient.addDomain
				.withArgs(1, "domain.com")
				.resolves({
					primaryOrganisationId: 1,
					domain: {
						domain: "domain.com",
						id: 1
					},
					updatedChildOrganisationIds: [],
					skippedChildOrganisationIds: []
				})
			const result = await organisationalUnitService.addDomain(1, "domain.com")
			expect(result.organisationalUnit.doesDomainExist("domain.com")).to.be.true
			expect(result.childOrgsUpdatedCount).to.eql(0)
			expect(result.domain).to.eql("domain.com")
		})

		it('Add the domain to the organisation and child organisations', async () => {
			const grandParent = getOrg('Grandparent', 'Grandparent', 1)
			const parent = getOrg('Parent', 'Grandparent | Parent', 2, 1)
			organisationalUnitTypeaheadCache.getTypeahead.resolves(new OrganisationalUnitTypeAhead([grandParent]))
			organisationalUnitCache.get.withArgs(1).resolves(grandParent)
			organisationalUnitCache.get.withArgs(2).resolves(parent)
			organisationalUnitClient.addDomain
				.withArgs(1, "domain.com")
				.resolves({
					primaryOrganisationId: 1,
					domain: {
						domain: "domain.com",
						id: 1
					},
					updatedChildOrganisationIds: [2],
					skippedChildOrganisationIds: []
				})
			const result = await organisationalUnitService.addDomain(1, "domain.com")
			expect(organisationalUnitCache.setMultiple).to.be.calledOnce
			expect(result.organisationalUnit.doesDomainExist("domain.com")).to.be.true
			expect(result.childOrgsUpdatedCount).to.eql(1)
			expect(result.domain).to.eql("domain.com")
		})
	})
})
