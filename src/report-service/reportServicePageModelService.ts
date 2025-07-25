import {TableService} from '../templating/tableService'
import {Chart} from './model/chart'
import {CourseFilterSummaryRow} from '../controllers/reporting/model/courseFilterSummaryRow'
import {ReportingFilterSummary} from '../controllers/reporting/model/reportingFilterSummary'
import {OrganisationFilterSummaryRow} from '../controllers/reporting/model/organisationFilterSummaryRow'
import {ChartJsService} from './chartJsService'
import {
	FilterSummaryTag,
	getAllOrganisationsSummaryTag,
	getMultipleCourseSummaryTags,
	getOrganisationSummaryTagById,
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

	async buildReportingFilterSummary(session: CourseCompletionsSession) {
		const coursesFilterSummary = new CourseFilterSummaryRow(getMultipleCourseSummaryTags(session.courses || []))
		
		let organisationFilterSummary

		if(session.selectedOrganisations){
			const filterSummaryTags: FilterSummaryTag[] = session.selectedOrganisations.map(org => getOrganisationSummaryTagById(org.id.toString(), org.name))
			filterSummaryTags[0].preText = ""
			organisationFilterSummary = new OrganisationFilterSummaryRow(filterSummaryTags)
		}
		else{
			organisationFilterSummary = new OrganisationFilterSummaryRow([getAllOrganisationsSummaryTag()])
		}

		const dateFilterSummary = new DateFilterSummaryRow(getDashboardTimePeriod(session).tags)
		return new ReportingFilterSummary(organisationFilterSummary, coursesFilterSummary, dateFilterSummary)
	}

}
