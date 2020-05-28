import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {Csrs} from '../../../../src/csrs'
import {OrganisationalUnitFactory} from '../../../../src/csrs/model/organisationalUnitFactory'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'
import {AgencyTokenCapacityUsedHttpService} from '../../../../src/identity/agencyTokenCapacityUsedHttpService'
import {AgencyTokenCapacityUsed} from '../../../../src/identity/model/AgencyTokenCapacityUsed'
import {AgencyDomain} from '../../../../src/csrs/model/agencyDomain'

chai.use(sinonChai)

describe('OrganisationalUnitService tests', () => {
	let csrs: Csrs
	let organisationalUnitFactory: OrganisationalUnitFactory
	let organisationalUnitService: OrganisationalUnitService
	let agencyTokenCapacityUsedHttpService: AgencyTokenCapacityUsedHttpService

	beforeEach(() => {
		csrs = <Csrs>{}
		organisationalUnitFactory = <OrganisationalUnitFactory>{}
		agencyTokenCapacityUsedHttpService = <AgencyTokenCapacityUsedHttpService>{}
		organisationalUnitService = new OrganisationalUnitService(csrs, organisationalUnitFactory, agencyTokenCapacityUsedHttpService)
	})

	it('should get organisationalUnit data', async () => {
		let uri = '1'
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id = uri

		const parent: OrganisationalUnit = new OrganisationalUnit()
		parent.id = '2'

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

		const getOrganisationalUnit = sinon.stub().returns(organisationalUnit)
		organisationalUnitFactory.create = getOrganisationalUnit

		const data = {
			id: '1',
		}

		const result = await organisationalUnitService.getOrganisationalUnit(uri)

		expect(result).to.eql(data)
	})

	it('should get organisational unit data with agency token data', async () => {
		let uri = '1'
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id = uri

		const parent: OrganisationalUnit = new OrganisationalUnit()
		parent.id = '2'

		const agency: AgencyToken = new AgencyToken()
		agency.uid = '123'
		agency.capacity = 200
		agency.token = 'token978'
		let ad1: AgencyDomain = new AgencyDomain()
		ad1.domain = 'domain1'
		let ad2: AgencyDomain = new AgencyDomain()
		ad2.domain = 'domain2'
		let agencyDomains: AgencyDomain[] = [ad1, ad2]
		agency.agencyDomains = agencyDomains

		const agencyTokenCapacityUsed: AgencyTokenCapacityUsed = new AgencyTokenCapacityUsed()
		agencyTokenCapacityUsed.capacityUsed = '9'

		organisationalUnit.agencyToken = agency

		// TODO - Ask Matt about mocking issue, the parent breaks it
		/*const parentOrg = sinon
			.stub()
			.withArgs(`${uri}/parent`)
			.resolves(parent)
		csrs.getOrganisationalUnit = parentOrg*/

		const organisation = sinon
			.stub()
			.withArgs(uri)
			.resolves(organisationalUnit)
		csrs.getOrganisationalUnit = organisation

		/*const parentOrg = sinon
			.stub()
			.withArgs(`${uri}/parent`)
			.resolves(parent)
		csrs.getOrganisationalUnit = parentOrg
*/

		const capacityUsedResponse = sinon
			.stub()
			.withArgs(`${agency.uid}`)
			.resolves(agencyTokenCapacityUsed)
		agencyTokenCapacityUsedHttpService.getCapacityUsed = capacityUsedResponse

		const getOrganisationalUnit = sinon.stub().returns(organisationalUnit)
		organisationalUnitFactory.create = getOrganisationalUnit

		const expectedAgencyTokenData = {
			agencyDomains: [
				{
					domain: 'domain1',
				},
				{
					domain: 'domain2',
				},
			],
			capacity: 200,
			capacityUsed: '9',
			token: 'token978',
			uid: '123',
		}

		const expectedData = {
			id: '1',
			agencyToken: expectedAgencyTokenData,
		}

		const result = await organisationalUnitService.getOrganisationalUnit(uri)

		expect(result).to.eql(expectedData)
	})
})
