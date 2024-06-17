import {FilterSummaryTag} from '../../models/filterSummary/filterSummaryTag'

export class CourseFilterSummaryTag extends FilterSummaryTag {
	constructor(public courseName: string) {
		super(courseName, "", "")
	}
}
