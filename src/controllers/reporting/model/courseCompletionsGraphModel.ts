import { ChartjsConfig} from '../../../report-service/model/chartConfig/chartjsConfig'
import {ReportingFilterSummary} from './reportingFilterSummary'
import {DashboardTimePeriodType} from './dashboardTimePeriod'
import {CourseCompletionsFilterModel} from './courseCompletionsFilterModel'

export class CourseCompletionsGraphModel extends CourseCompletionsFilterModel {

	constructor(public chart: ChartjsConfig, public table: {text: string}[][], public courseBreakdown: {text: string}[][],
				public selectedFilters: ReportingFilterSummary, public hasRequestedReport: boolean,
				timePeriod: DashboardTimePeriodType, public startDay?: string, public startMonth?: string,
				public startYear?: string, public endDay?: string, public endMonth?: string, public endYear?: string,
				public errors?: {fields: any, size: any}) {
		super(timePeriod, startDay, startMonth, startYear, endDay, endMonth, endYear, errors)
		this.timePeriod = timePeriod
	}

	public updateWithFilters(filterModel: CourseCompletionsFilterModel) {
		this.timePeriod = filterModel.timePeriod
		this.startDay = filterModel.startDay
		this.startMonth = filterModel.startMonth
		this.startYear = filterModel.startYear
		this.endDay = filterModel.endDay
		this.endMonth = filterModel.endMonth
		this.endYear = filterModel.endYear
		this.errors = filterModel.errors
	}

	public timePeriod: DashboardTimePeriodType = 'today'
}
