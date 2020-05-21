import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {Csrs} from '../../../../src/csrs'
import {OrganisationalUnitFactory} from '../../../../src/csrs/model/organisationalUnitFactory'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {AgencyTokenHttpService} from '../../../../src/csrs/agencyTokenHttpService'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'
import {AgencyTokenCapacityUsedHttpService} from '../../../../src/csrs/service/agencyTokenCapacityUsedHttpService'

chai.use(sinonChai)

describe('OrganisationalUnitService tests', () => {
	let csrs: Csrs
	let organisationalUnitFactory: OrganisationalUnitFactory
	let organisationalUnitService: OrganisationalUnitService
	let agencyTokenHttpService: AgencyTokenHttpService
	let agencyTokenCapacityUsedHttpService: AgencyTokenCapacityUsedHttpService

	beforeEach(() => {
		csrs = <Csrs>{}
		organisationalUnitFactory = <OrganisationalUnitFactory>{}
		agencyTokenHttpService = <AgencyTokenHttpService>{}
		organisationalUnitService = new OrganisationalUnitService(csrs, organisationalUnitFactory, agencyTokenHttpService, agencyTokenCapacityUsedHttpService)
	})

	it('should get organisationalUnit data', async () => {
		let uri = '1'
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id = uri

		const parent: OrganisationalUnit = new OrganisationalUnit()
		parent.id = '2'

		const agency: AgencyToken = new AgencyToken()

		const organisation = sinon
			.stub()
			.withArgs(uri)
			.resolves(organisationalUnit)
		csrs.getOrganisationalUnit = organisation

		const parentOrg = sinon
			.stub()
			.withArgs(`${uri}/parent`)
			.resolves(parent)
		csrs.getOrganisationalUnit = parentOrg

		const agencyToken = sinon
			.stub()
			.withArgs(`${uri}`)
			.resolves(agency)

		const getOrganisationalUnit = sinon.stub().returns(organisationalUnit)
		organisationalUnitFactory.create = getOrganisationalUnit
		agencyTokenHttpService.getAgencyToken = agencyToken

		const data = {
			id: '1',
		}

		const result = await organisationalUnitService.getOrganisationalUnit(uri)

		expect(result).to.eql(data)
	})
})
