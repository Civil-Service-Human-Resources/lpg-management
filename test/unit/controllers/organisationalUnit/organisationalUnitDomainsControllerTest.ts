import {app} from '../../../utils/testApp'
import {
	OrganisationalUnitDomainsController
} from '../../../../src/controllers/organisationalUnit/organisationalUnitDomainsController'
import * as sinon from 'sinon'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {Domain} from '../../../../src/csrs/model/domain'

describe('organisationalUnitDomainsController tests', () => {
	let organisationalUnitService: sinon.SinonStubbedInstance<OrganisationalUnitService> = sinon.createStubInstance(OrganisationalUnitService)
	const controller: OrganisationalUnitDomainsController = new OrganisationalUnitDomainsController(organisationalUnitService as any)
	app.use(controller.path, controller.buildRouter())
	describe('Add new domain to organisation tests', () => {
		const org = new OrganisationalUnit()
		org.id = 1
		org.domains = [new Domain(1, 'domain.com')]
		organisationalUnitService.getOrganisation.withArgs(1).resolves(org)
		it('should return an error when an attempting to add an existing domain', async (done) => {

		})
	})
})
