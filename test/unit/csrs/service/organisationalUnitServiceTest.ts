import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'
import { OrganisationalUnitClient } from '../../../../src/csrs/client/organisationalUnitClient'
import { OrganisationalUnitCache } from '../../../../src/csrs/organisationalUnitCache'
import { AgencyTokenCapacityUsedHttpService } from '../../../../src/identity/agencyTokenCapacityUsedHttpService'
import { OrganisationalUnitTypeaheadCache } from '../../../../src/csrs/organisationalUnitTypeaheadCache'

chai.use(sinonChai)

describe('OrganisationalUnitService tests', () => {
	let organisationalUnitClient: OrganisationalUnitClient
	let organisationalUnitCache: OrganisationalUnitCache
	let organisationalUnitTypeaheadCache: OrganisationalUnitTypeaheadCache
	let organisationalUnitService: OrganisationalUnitService
	let agencyTokenCapacityUsedService: AgencyTokenCapacityUsedHttpService

	beforeEach(() => {
		organisationalUnitClient = <OrganisationalUnitClient>{}
		organisationalUnitCache = <OrganisationalUnitCache>{}
		organisationalUnitTypeaheadCache = <OrganisationalUnitTypeaheadCache>{}
		agencyTokenCapacityUsedService = <AgencyTokenCapacityUsedHttpService>{}
		organisationalUnitService = new OrganisationalUnitService(
			organisationalUnitCache, organisationalUnitTypeaheadCache,
			organisationalUnitClient, agencyTokenCapacityUsedService
		)
	})

	it('should get organisationalUnit data', async () => {
		const agencyToken: AgencyToken = new AgencyToken()
		agencyToken.uid = 'uid'

		let uri = 1
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id = uri
		organisationalUnit.agencyToken = agencyToken

		const parent: OrganisationalUnit = new OrganisationalUnit()
		parent.id = 2

		const organisation = sinon
			.stub()
			.withArgs(uri)
			.resolves(organisationalUnit)
		organisationalUnitService.getOrganisation = organisation

		const parentOrg = sinon
			.stub()
			.withArgs(`${uri}/parent`)
			.resolves(parent)
		organisationalUnitService.getOrganisation = parentOrg

		const agencyTokenStub = sinon
			.stub()
			.withArgs('uid')
			.resolves(1)
		agencyTokenCapacityUsedService.getCapacityUsed = agencyTokenStub

		const data = {
			id: '1',
			agencyToken: agencyToken,
		}

		const result = await organisationalUnitService.getOrganisation(uri)

		expect(result).to.eql(data)
	})
})
