import {FilterSummaryRow} from '../../models/filterSummary/filterSummaryRow'
import {CourseFilterSummaryTag} from './courseFilterSummaryTag'

export class CourseFilterSummaryRow extends FilterSummaryRow {
	constructor(tags: CourseFilterSummaryTag[]) {
		super("Courses", tags, "/reporting/course-completions",
			"/reporting/course-completions/choose-courses", "Change courses")
	}

	public static create(courses: {name: string, id: string}[]): CourseFilterSummaryRow {
		const tags = courses.map(course => new CourseFilterSummaryTag(course.name, course.id))
		tags[0].preText = undefined
		return new CourseFilterSummaryRow(tags)
	}
}
