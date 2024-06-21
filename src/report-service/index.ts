import {DateStartEnd} from '../learning-catalogue/model/dateStartEnd'
import {ReportServiceClient} from './reportServiceClient'
import {CourseService} from 'lib/courseService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {Report} from '../controllers/reporting/Report'
import {BasicCourse, ChooseCoursesModel} from '../controllers/reporting/model/chooseCoursesModel'
import {GetCourseAggregationParameters} from './model/getCourseAggregationParameters'
import {CourseCompletionsGraphModel} from '../controllers/reporting/model/courseCompletionsGraphModel'
import {CslServiceClient} from '../csl-service/client'
import {ChartService} from './chartService'
import {OrganisationFilterSummaryRow} from '../controllers/reporting/model/organisationFilterSummaryRow'
import {ReportingFilterSummary} from '../controllers/reporting/model/reportingFilterSummary'

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
		const allCourses = await this.courseService.getCourseDropdown()
		const hierarchy = await this.organisationalUnitService.getOrgHierarchy(userOrganisation.id)
		const departmentCodes = hierarchy.map(o => o.code)
		const requiredLearningResponse = await this.courseService.getRequiredLearning(departmentCodes)
		const requiredLearning: BasicCourse[] = requiredLearningResponse.results
			.map(c => new BasicCourse(c.id, c.title))
		return new ChooseCoursesModel(userOrganisation.getFormattedName(), requiredLearning, allCourses)
	}

	async validateCourseSelections(courseIds: string[]) {
		const allCourseIds = (await this.courseService.getCourseDropdown()).map(c => c.value)
		return courseIds.every(id => allCourseIds.includes(id))
	}

	async getCourseCompletionsReportGraphPage(params: GetCourseAggregationParameters): Promise<CourseCompletionsGraphModel> {
		const chart = await this.cslService.getCourseCompletionsAggregationsChart(params)
		const chartJsConfig = this.chartService.buildChart(params.startDate, params.endDate, chart.chart)
		const tableModel = chartJsConfig.noJSChart.map(dp => [{text: dp.x}, {text: dp.y.toString()}])
		const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
		const courseBreakdown = Array.from(chart.courseBreakdown).map(([title, count]) => {
			return [{text: title}, {text: count.toString()}]
		}).sort((a, b) => { return collator.compare(a[0].text, b[0].text!)})
		courseBreakdown.push([{text: "Total"}, {text: chart.total.toString()}])
		const organisationalUnit = await this.organisationalUnitService.getOrganisation(parseInt(params.organisationIds[0]))
		const filterSummary = new ReportingFilterSummary(OrganisationFilterSummaryRow.create([organisationalUnit.name]))
		return new CourseCompletionsGraphModel(chartJsConfig, tableModel, courseBreakdown, filterSummary)
	}

}
