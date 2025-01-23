import {TableService} from '../templating/tableService'
import {Chart} from './model/chart'
import {CourseFilterSummaryRow} from '../controllers/reporting/model/courseFilterSummaryRow'
import {ReportingFilterSummary} from '../controllers/reporting/model/reportingFilterSummary'
import {OrganisationFilterSummaryRow} from '../controllers/reporting/model/organisationFilterSummaryRow'
import {ChartJsService} from './chartJsService'
import {
	getMultipleCourseSummaryTags,
	getOrganisationSummaryTags,
} from '../controllers/models/filterSummary/filterSummaryTag'
import {CourseCompletionsSession} from '../controllers/reporting/model/courseCompletionsSession'
import {DateFilterSummaryRow} from '../controllers/reporting/model/dateFilterSummaryRow'
import {getDashboardTimePeriod} from '../controllers/reporting/model/dashboardTimePeriod'

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

	buildReportingFilterSummary(session: CourseCompletionsSession) {
		const coursesFilterSummary = new CourseFilterSummaryRow(getMultipleCourseSummaryTags(session.courses || []))
		const organisationFilterSummary = new OrganisationFilterSummaryRow(getOrganisationSummaryTags([session.selectedOrganisation!.name]))
		const dateFilterSummary = new DateFilterSummaryRow(getDashboardTimePeriod(session).tags)
		return new ReportingFilterSummary(organisationFilterSummary, coursesFilterSummary, dateFilterSummary)
	}

}
