import {FormattedOrganisation} from '../../../csl-service/model/organisationalUnit/FormattedOrganisation'
import {OrganisationSelection} from './chooseOrganisationsModel'

export interface IOrganisationSession {
	selectedOrganisations?: FormattedOrganisation[]
	organisationFormSelection?: OrganisationSelection | number

	hasSelectedOrganisations(): boolean
}
