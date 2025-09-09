import {Type} from 'class-transformer'
import {FormattedOrganisation} from '../../../csl-service/model/FormattedOrganisation'
import {OrganisationSelection} from './chooseOrganisationsModel'
import {IOrganisationSession} from './IOrganisationSession'

export class ChooseOrganisationSession implements IOrganisationSession {

	@Type(() => FormattedOrganisation)
	public selectedOrganisations?: FormattedOrganisation[]

	constructor(public userEmail: string,
				public fullName: string,
				public userUid: string,
				public organisationFormSelection?: OrganisationSelection | number,
				selectedOrganisations?: FormattedOrganisation[]) {
		this.selectedOrganisations = selectedOrganisations
	}

	hasSelectedOrganisations() {
		const allOrganisationsSelected = this.organisationFormSelection === "allOrganisations"
		const specificOrganisationIdsSelected = this.selectedOrganisations !== undefined &&
			this.selectedOrganisations.length > 0

		return allOrganisationsSelected || specificOrganisationIdsSelected
	}

	getSelectedOrganisationIds() {
		return (this.selectedOrganisations || []).map(org => org.id)
	}
}
