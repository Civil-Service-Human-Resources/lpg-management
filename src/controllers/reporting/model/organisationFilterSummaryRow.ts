import {FilterSummaryRow} from '../../models/filterSummary/filterSummaryRow'
import {FilterSummaryTag} from '../../models/filterSummary/filterSummaryTag'

export class OrganisationFilterSummaryRow extends FilterSummaryRow {
	constructor(tags: FilterSummaryTag[]) {
		super("Reporting on", tags, "/reporting/course-completions",
			"/reporting/course-completions/choose-organisation", "Change organisation")
	}
}
