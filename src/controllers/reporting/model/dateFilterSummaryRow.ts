import {FilterSummaryRow} from '../../models/filterSummary/filterSummaryRow'
import {DateFilterSummaryTag} from './dateFilterSummaryTag'
import {DashboardTimePeriod} from './dashboardTimePeriod'

export class DateFilterSummaryRow extends FilterSummaryRow {
	constructor(tags: DateFilterSummaryTag[]) {
		super("When", tags, "/reporting/course-completions")
	}

	public static createForSinglePeriod(timePeriod: DashboardTimePeriod): DateFilterSummaryRow {
		return new DateFilterSummaryRow([DateFilterSummaryTag.createForTimePeriod(timePeriod)])
	}
}
