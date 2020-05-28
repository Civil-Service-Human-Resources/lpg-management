import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {Csrs} from '../../../../src/csrs'
import {OrganisationalUnitFactory} from '../../../../src/csrs/model/organisationalUnitFactory'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {AgencyTokenCapacityUsedHttpService} from '../../../../src/identity/agencyTokenCapacityUsedHttpService'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'

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
		const agencyToken: AgencyToken = new AgencyToken()
		agencyToken.uid = 'uid'

		let uri = '1'
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id = uri
		organisationalUnit.agencyToken = agencyToken

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

		const agencyTokenStub = sinon
			.stub()
			.withArgs('uid')
			.resolves(agencyToken)
		agencyTokenCapacityUsedHttpService.getCapacityUsed = agencyTokenStub

		const getOrganisationalUnit = sinon.stub().returns(organisationalUnit)
		organisationalUnitFactory.create = getOrganisationalUnit

		const data = {
			id: '1',
			agencyToken: agencyToken,
		}

		const result = await organisationalUnitService.getOrganisationalUnit(uri)

		expect(result).to.eql(data)
	})
})
