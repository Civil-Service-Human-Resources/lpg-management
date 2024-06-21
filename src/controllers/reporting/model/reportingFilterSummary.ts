import {FilterSummary} from '../../models/filterSummary/filterSummary'
import {OrganisationFilterSummaryRow} from './organisationFilterSummaryRow'
import {CourseFilterSummaryRow} from './courseFilterSummaryRow'

export class ReportingFilterSummary extends FilterSummary {
	constructor(organisations: OrganisationFilterSummaryRow, courses: CourseFilterSummaryRow) {
		super([organisations, courses], "/reporting/course-completions")
	}
}
