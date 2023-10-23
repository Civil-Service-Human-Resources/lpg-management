import {Domain} from '../model/domain'

export class RemoveDomainFromOrgResponse {
	primaryOrganisationId: number
	domain: Domain
	updatedChildOrganisationIds: number[]
}
