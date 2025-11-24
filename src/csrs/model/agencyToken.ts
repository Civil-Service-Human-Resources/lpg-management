import {Domain} from './domain'

export class AgencyToken {
	constructor (
		public uid: string,
		public token: string,
		public capacity: number,
		public capacityUsed: number,
		public agencyDomains: Domain[]
	) {}
}
