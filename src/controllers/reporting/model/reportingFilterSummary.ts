import {FilterSummary} from '../../models/filterSummary/filterSummary'
import {OrganisationFilterSummaryRow} from './organisationFilterSummaryRow'
import {CourseFilterSummaryRow} from './courseFilterSummaryRow'
import {DateFilterSummaryRow} from './dateFilterSummaryRow'

export class ReportingFilterSummary extends FilterSummary {
	constructor(organisations: OrganisationFilterSummaryRow, courses: CourseFilterSummaryRow, date: DateFilterSummaryRow) {
		super([organisations, courses, date], "/reporting/course-completions")
	}
}
