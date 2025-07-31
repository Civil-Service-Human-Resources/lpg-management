export class GetOrganisationsFormattedParams {
	constructor(public domain?: string, public otherOrganisations?: number[], public isTierOne?: boolean) {}

	public getCacheKey() {
		if (this.domain === undefined && this.otherOrganisations === undefined) {
			return 'all'
		} else {
			return [this.domain, ...[this.otherOrganisations || []], this.isTierOne || ''].join(",")
		}
	}
}
