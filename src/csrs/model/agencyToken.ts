import {AgencyDomain} from './agencyDomain'
import {IsNumberString} from 'class-validator'

export class AgencyToken {
	id: string

	uid: string

	token: string

	@IsNumberString({
		groups: ['all', 'capacity'],
		message: 'agencyToken.validation.capacity.invalid',
	})
	capacity: number

	capacityUsed: number

	agencyDomains: AgencyDomain[]
}
