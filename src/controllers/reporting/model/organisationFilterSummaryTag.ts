import {FilterSummaryTag} from '../../models/filterSummary/filterSummaryTag'

export class OrganisationFilterSummaryTag extends FilterSummaryTag {
	constructor(public organisationName: string) {
		super(organisationName, "", "")
	}
}
