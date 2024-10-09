import {FilterSummaryRow} from '../../models/filterSummary/filterSummaryRow'
import {OrganisationFilterSummaryTag} from './organisationFilterSummaryTag'

export class OrganisationFilterSummaryRow extends FilterSummaryRow {
	constructor(tags: OrganisationFilterSummaryTag[]) {
		super("Reporting on", tags, "/reporting/course-completions",
			"/reporting/course-completions/choose-organisation", "Change organisation")
	}

	public static create(organisationNames: string[]): OrganisationFilterSummaryRow {
		return new OrganisationFilterSummaryRow(organisationNames.map(name => new OrganisationFilterSummaryTag(name)))
	}
}
