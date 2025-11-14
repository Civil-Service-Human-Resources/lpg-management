import {OrganisationalUnitDomainsController} from './organisationalUnitDomainsController'
import {AgencyTokenController} from './agencyTokenController'
import {OrganisationController} from './organisationController'
import {AgencyTokenService} from '../../lib/agencyTokenService'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import {Controller} from '../controller'

export function buildOrganisationalUnitControllers(organisationalUnitService: OrganisationalUnitService): Controller[] {
	const agencyTokenService = new AgencyTokenService()
	return [
		new OrganisationController(organisationalUnitService),
		new AgencyTokenController(organisationalUnitService, agencyTokenService),
		new OrganisationalUnitDomainsController(organisationalUnitService)
	]
}
