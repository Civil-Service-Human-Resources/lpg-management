import {OrganisationalUnit} from '../organisationalUnit'
import {Domain} from '../domain'

export enum DomainUpdate {
	REMOVED = 'REMOVED',
	ADDED = 'ADDED'
}

export interface DomainUpdateSuccessResponse {
	organisationalUnit: OrganisationalUnit
	domain: Domain
	updatedIds: number[]
}

export interface DomainUpdateSuccess extends DomainUpdateSuccessResponse {
	update: DomainUpdate
}
