export class GetOrganisationsFormattedParams {
	constructor(public domain?: string, public otherOrganisationIds?: number[], public isTierOne?: boolean) {}

	public getCacheKey() {
		if (this.domain === undefined && this.otherOrganisationIds === undefined) {
			return 'all'
		} else {
			const parts = [this.domain]
			if (this.otherOrganisationIds !== undefined) {
				parts.push(...this.otherOrganisationIds.map(o => o.toString()))
			}
			if (this.isTierOne !== undefined) {
				parts.push(...this.isTierOne.toString())
			}
			return parts.join(",")
		}
	}
}
