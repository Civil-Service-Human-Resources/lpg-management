import {OrganisationalUnit} from '../organisationalUnit'

export interface DomainAddedSuccess {
	organisationalUnit: OrganisationalUnit
	domain: string
	childOrgsUpdatedCount: number
}
