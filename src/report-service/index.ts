import {DateStartEnd} from '../learning-catalogue/model/dateStartEnd'
import {ReportServiceClient} from './reportServiceClient'
import {CourseService} from 'lib/courseService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {Report} from '../controllers/reporting/Report'
import {BasicCoursePageModel, ChooseCoursesModel} from '../controllers/reporting/model/chooseCoursesModel'
import {GetCourseAggregationParameters} from './model/getCourseAggregationParameters'
import {CourseCompletionsGraphModel} from '../controllers/reporting/model/courseCompletionsGraphModel'
import {CslServiceClient} from '../csl-service/client'
import {ChartService} from './chartService'
import {OrganisationFilterSummaryRow} from '../controllers/reporting/model/organisationFilterSummaryRow'
import {ReportingFilterSummary} from '../controllers/reporting/model/reportingFilterSummary'
import {CourseCompletionsSession} from '../controllers/reporting/model/courseCompletionsSession'
import {CourseFilterSummaryRow} from '../controllers/reporting/model/courseFilterSummaryRow'
import {CourseCompletionsFilterModel} from '../controllers/reporting/model/courseCompletionsFilterModel'
import {DateFilterSummaryRow} from '../controllers/reporting/model/dateFilterSummaryRow'

export class ReportService {

	constructor(private client: ReportServiceClient, private courseService: CourseService,
				private organisationalUnitService: OrganisationalUnitService, private cslService: CslServiceClient,
				private chartService: ChartService) {
	}

	async getReport(reportType: Report, dateRange: DateStartEnd): Promise<Buffer> {
		let report = ""
		switch (reportType) {
			case Report.LEARNER_RECORD: {
				report = await this.client.getReportLearnerRecord(dateRange)
				break
			}
			case Report.BOOKING: {
				report = await this.client.getReportBookingInformation(dateRange)
				break
			}
		}
		return Buffer.from(report, 'binary')
	}

	async getChooseCoursePage(selectedOrganisationId: number): Promise<ChooseCoursesModel> {
		const userOrganisation = (await this.organisationalUnitService.getOrganisation(selectedOrganisationId, true))
		const allCourses = (await this.courseService.getCourseDropdown())
			.map(course => new BasicCoursePageModel(course.id, course.name))
		const hierarchy = await this.organisationalUnitService.getOrgHierarchy(userOrganisation.id)
		const departmentCodes = hierarchy.map(o => o.code)
		const requiredLearningResponse = await this.courseService.getRequiredLearning(departmentCodes)
		const requiredLearning: BasicCoursePageModel[] = requiredLearningResponse.results
			.map(c => new BasicCoursePageModel(c.id, c.title))
		return new ChooseCoursesModel(userOrganisation.getFormattedName(), requiredLearning, allCourses)
	}

	async fetchCoursesWithIds(courseIds: string[]) {
		return (await this.courseService.getCourseDropdown())
			.filter(course => courseIds.includes(course.id))
	}

	async getCourseCompletionsReportGraphPage(pageModel: CourseCompletionsFilterModel, session: CourseCompletionsSession): Promise<{pageModel: CourseCompletionsGraphModel, session: CourseCompletionsSession}> {
		const params = GetCourseAggregationParameters.createFromFilterPageModel(pageModel, session)
		const chart = await this.cslService.getCourseCompletionsAggregationsChart(params)
		const chartJsConfig = this.chartService.buildChart(params.startDate, params.endDate, chart.getChartData(params.binDelimiter))
		const tableModel = chartJsConfig.noJSChart.map(dp => [{text: dp.x}, {text: dp.y.toString(), format: "numeric"}])
		const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
		const courseBreakdown = Array.from(chart.courseBreakdown).map(([title, count]) => {
			return [{text: title}, {text: count.toString(), format: "numeric"}]
		}).sort((a, b) => { return collator.compare(a[0].text, b[0].text!)})
		courseBreakdown.push([{text: "Total"}, {text: chart.total.toString(), format: "numeric"}])
		const organisationalUnit = await this.organisationalUnitService.getOrganisation(parseInt(params.organisationIds[0]))
		const coursesFilterSummary = CourseFilterSummaryRow.create(session.courses!)
		const dateFilterSummary = DateFilterSummaryRow.createForSinglePeriod(pageModel.getTimePeriod())
		const filterSummary = new ReportingFilterSummary(OrganisationFilterSummaryRow.create([organisationalUnit.name]), coursesFilterSummary, dateFilterSummary)
		const graphPageModel = new CourseCompletionsGraphModel(chartJsConfig, tableModel, courseBreakdown, filterSummary, pageModel)
		session.chartData = graphPageModel.table
		return {
			pageModel: graphPageModel,
			session
		}
	}

}
