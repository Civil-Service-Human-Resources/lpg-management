import {FilterSummaryRow} from '../../models/filterSummary/filterSummaryRow'
import {FilterSummaryTag} from '../../models/filterSummary/filterSummaryTag'

export class CourseFilterSummaryRow extends FilterSummaryRow {
	constructor(tags: FilterSummaryTag[]) {
		super("Courses", tags, "/reporting/course-completions",
			"/reporting/course-completions/choose-courses", "Change courses")
	}
}
