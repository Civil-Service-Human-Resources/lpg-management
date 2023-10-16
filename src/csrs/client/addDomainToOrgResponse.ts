import {Domain} from '../model/domain'

export class AddDomainToOrgResponse {
	primaryOrganisationId: number
	domain: Domain
	updatedChildOrganisationIds: number[]
	skippedChildOrganisationIds: number[]
}
