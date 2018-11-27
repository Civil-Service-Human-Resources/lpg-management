import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {EntityService} from '../../../src/learning-catalogue/service/entityService'
import {Auth} from '../../../src/identity/auth'
import {OrganisationalUnit} from '../../../src/csrs/model/organisationalUnit'
import {Csrs} from '../../../src/csrs'
import {CsrsConfig} from '../../../src/csrs/csrsConfig'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('CSRS tests', () => {
	let organisationalUnitService: EntityService<OrganisationalUnit>

	const config = new CsrsConfig('http://example.org', 1500)

	let csrs: Csrs

	beforeEach(() => {
		organisationalUnitService = <EntityService<OrganisationalUnit>>{}

		csrs = new Csrs(config, {} as Auth)
		csrs.organisationalUnitService = organisationalUnitService
	})

	it('should call organisationalUnitService when listing organisational units', async () => {
		organisationalUnitService.listAll = sinon.stub()

		await csrs.listOrganisationalUnits()

		return expect(organisationalUnitService.listAll).to.have.been.calledOnceWith(`/organisationalUnits/tree`)
	})

	it('should call organisationalUnitService when listing organisational units for typeahead', async () => {
		organisationalUnitService.listAllAsRawData = sinon.stub()

		await csrs.listOrganisationalUnitsForTypehead()

		return expect(organisationalUnitService.listAllAsRawData).to.have.been.calledOnceWith(`/organisationalUnits/flat`)
	})

	it('should call organisationalUnitService when creating organisational units', async () => {
		const organsationalUnit: OrganisationalUnit = new OrganisationalUnit()

		organisationalUnitService.create = sinon.stub()

		await csrs.createOrganisationalUnit(organsationalUnit)

		return expect(organisationalUnitService.create).to.have.been.calledOnceWith(`/organisationalUnits/`, organsationalUnit)
	})
})
