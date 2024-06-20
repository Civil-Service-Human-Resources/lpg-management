import {FilterSummaryTag} from '../../models/filterSummary/filterSummaryTag'
import {DashboardTimePeriod} from './dashboardTimePeriod'

export class DateFilterSummaryTag extends FilterSummaryTag {
	constructor(public period: string, public periodValue: string) {
		super(period, "timePeriod", periodValue)
	}

	public static createForTimePeriod(timePeriod: DashboardTimePeriod) {
		return new DateFilterSummaryTag(timePeriod.text, timePeriod.formValue)
	}
}
