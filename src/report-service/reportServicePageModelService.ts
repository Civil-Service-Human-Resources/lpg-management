import {TableService} from '../templating/tableService'
import {Chart} from './model/chart'
import {CourseFilterSummaryRow} from '../controllers/reporting/model/courseFilterSummaryRow'
import {DateFilterSummaryRow} from '../controllers/reporting/model/dateFilterSummaryRow'
import {ReportingFilterSummary} from '../controllers/reporting/model/reportingFilterSummary'
import {OrganisationFilterSummaryRow} from '../controllers/reporting/model/organisationFilterSummaryRow'
import {DashboardTimePeriod} from '../controllers/reporting/model/dashboardTimePeriod'
import {ChartJsService} from './chartJsService'

export class ReportServicePageModelService {

	constructor(private tableService: TableService, private chartService: ChartJsService) { }

	buildCourseCompletionsChart(chartData: Chart) {
		return this.chartService.buildChart(chartData.chart, chartData.delimiter)
	}

	buildNoJSTable(noJsChart: Map<string, number>) {
		return this.tableService.convertDataToNumericTable(noJsChart)
	}

	buildCourseBreakdownTable(chartData: Chart) {
		return [
			...this.tableService.convertDataToNumericTable(chartData.courseBreakdown),
			...this.tableService.convertDataToNumericTable(new Map<string, number>([["Total", chartData.total]]))
		]
	}

	buildReportingFilterSummary(courses: {name: string, id: string}[], timePeriod: DashboardTimePeriod, selectedOrganisation: {name: string, id: string}) {
		const coursesFilterSummary = CourseFilterSummaryRow.create(courses)
		const dateFilterSummary = DateFilterSummaryRow.createForSinglePeriod(timePeriod)
		return new ReportingFilterSummary(OrganisationFilterSummaryRow.create([selectedOrganisation.name]), coursesFilterSummary, dateFilterSummary)
	}

}
