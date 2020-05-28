import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {AgencyTokenCapacityUsedHttpService} from '../../../src/identity/agencyTokenCapacityUsedHttpService'
import {AgencyTokenCapacityUsed} from '../../../src/identity/model/AgencyTokenCapacityUsed'
import {IdentityConfig} from '../../../src/identity/identityConfig'
import {Auth} from '../../../src/identity/auth'
import {describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import {EntityService} from '../../../src/learning-catalogue/service/entityService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('AgencyTokenCapacityUsedHttpService tests...', function() {
	let agencyTokenCapacityUsedHttpService: AgencyTokenCapacityUsedHttpService
	let agencyTokenCapacityUsedEntityService: EntityService<AgencyTokenCapacityUsed>
	const config = new IdentityConfig('http://example.org')

	beforeEach(function() {
		agencyTokenCapacityUsedEntityService = <EntityService<AgencyTokenCapacityUsed>>{}

		agencyTokenCapacityUsedHttpService = new AgencyTokenCapacityUsedHttpService(config, {} as Auth)
		agencyTokenCapacityUsedHttpService.agencyTokenCapacityUsedService = agencyTokenCapacityUsedEntityService
	})

	describe('#getCapacityUsed', () => {
		it('should get capacity used data', async () => {
			const data = new AgencyTokenCapacityUsed()
			data.capacityUsed = '5'
			agencyTokenCapacityUsedEntityService.get = sinon.stub().returns(Promise.resolve(data))

			const result = await agencyTokenCapacityUsedHttpService.getCapacityUsed('abc123')

			expect(agencyTokenCapacityUsedEntityService.get).to.have.been.calledOnceWith('/agency/abc123')
			expect(result).to.eql(data)
		})
	})
})
