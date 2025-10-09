import {OrganisationalUnit} from '../organisationalUnit'
import {Domain} from '../domain'

export enum DomainUpdate {
	REMOVED = 'REMOVED',
	ADDED = 'ADDED'
}

export interface DomainUpdateSuccessResponse {
	organisationalUnit: OrganisationalUnit
	domain: Domain
	updatedChildIds: number[]
}

export interface DomainUpdateSuccess extends DomainUpdateSuccessResponse {
	update: DomainUpdate
}
