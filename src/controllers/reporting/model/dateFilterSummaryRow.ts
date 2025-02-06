import {FilterSummaryRow} from '../../models/filterSummary/filterSummaryRow'
import {FilterSummaryTag} from '../../models/filterSummary/filterSummaryTag'

export class DateFilterSummaryRow extends FilterSummaryRow {
	constructor(tags: FilterSummaryTag[]) {
		super("When", tags, "/reporting/course-completions")
	}
}
