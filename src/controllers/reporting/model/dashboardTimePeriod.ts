import {DateFilterSummaryRow} from './dateFilterSummaryRow'
import {
	FilterSummaryTag, getCustomDateRangeFilterTags, getDateFilterSummaryTags,
} from '../../models/filterSummary/filterSummaryTag'
import {CourseCompletionsSession} from './courseCompletionsSession'

export const dashBoardTimePeriods = ["today", "past-seven-days", "past-month", "past-year", "custom"] as const
export type DashboardTimePeriodType = typeof dashBoardTimePeriods[number]

export class DashboardTimePeriod extends DateFilterSummaryRow {
	constructor(public tags: FilterSummaryTag[], public type: DashboardTimePeriodType) {
		super(tags)
	}
}

export const getDashboardTimePeriod = (session: CourseCompletionsSession) => {
	const summaryTags: FilterSummaryTag[] = []
	if (session.timePeriod === 'today') {
		summaryTags.push(getDateFilterSummaryTags('Today', 'today'))
	} else if (session.timePeriod === 'past-seven-days') {
		summaryTags.push(getDateFilterSummaryTags('Past seven days', 'past-seven-days'))
	} else if (session.timePeriod === 'past-month') {
		summaryTags.push(getDateFilterSummaryTags('Past month', 'past-month'))
	} else if (session.timePeriod === 'past-year') {
		summaryTags.push(getDateFilterSummaryTags('Past year', 'past-year'))
	} else if (session.timePeriod === 'custom') {
		summaryTags.push(...getCustomDateRangeFilterTags(session))
	}
	return new DashboardTimePeriod(summaryTags, session.timePeriod)
}
