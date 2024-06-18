import {FilterSummaryTag} from '../../models/filterSummary/filterSummaryTag'

export class CourseFilterSummaryTag extends FilterSummaryTag {
	constructor(public courseName: string, public courseId: string) {
		super(courseName, "courseId", courseId, "and", true, false)
	}
}
