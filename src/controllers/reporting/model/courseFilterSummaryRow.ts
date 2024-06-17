import {FilterSummaryRow} from '../../models/filterSummary/filterSummaryRow'
import {CourseFilterSummaryTag} from './courseFilterSummaryTag'

export class CourseFilterSummaryRow extends FilterSummaryRow {
	constructor(tags: CourseFilterSummaryTag[]) {
		super("Courses", tags, "/reporting/course-completions",
			"/reporting/course-completions/choose-courses", "Change courses")
	}

	public static create(courseNames: string[]): CourseFilterSummaryRow {
		return new CourseFilterSummaryRow(courseNames.map(name => new CourseFilterSummaryTag(name)))
	}
}
