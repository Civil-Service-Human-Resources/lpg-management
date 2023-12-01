import {OrganisationalUnit} from '../organisationalUnit'

export enum DomainUpdate {
	REMOVED = 'REMOVED',
	ADDED = 'ADDED'
}

export interface DomainUpdateSuccess {
	organisationalUnit: OrganisationalUnit
	domain: string
	childOrgsUpdatedCount: number
	update: DomainUpdate
}
