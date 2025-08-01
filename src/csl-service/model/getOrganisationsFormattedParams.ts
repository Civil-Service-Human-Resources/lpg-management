export class GetOrganisationsFormattedParams {
	constructor(public domain?: string, public organisationId?: number[], public isTierOne?: boolean) {}

	public getCacheKey() {
		if (this.domain === undefined && this.organisationId === undefined) {
			return 'all'
		} else {
			const parts = [this.domain]
			if (this.organisationId !== undefined) {
				parts.push(...this.organisationId.map(o => o.toString()))
			}
			if (this.isTierOne !== undefined) {
				parts.push(...this.isTierOne.toString())
			}
			return parts.join(",")
		}
	}
}
