import {ReportServiceClient} from './reportServiceClient'
import {CourseService} from 'lib/courseService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {Report} from '../controllers/reporting/Report'
import {BasicCoursePageModel, ChooseCoursesModel} from '../controllers/reporting/model/chooseCoursesModel'
import {CourseCompletionsGraphModel} from '../controllers/reporting/model/courseCompletionsGraphModel'
import {CslServiceClient} from '../csl-service/client'
import {CourseCompletionsSession} from '../controllers/reporting/model/courseCompletionsSession'
import {ReportParameterFactory} from './model/course-completions/reportParameterFactory'
import {Chart} from './model/chart'
import {RequestCourseCompletionExportRequestResponse} from './model/requestCourseCompletionExportRequestResponse'
import {ReportServicePageModelService} from './reportServicePageModelService'
import {DateStartEnd} from '../controllers/command/dateStartEndCommand'
import {ReportResponse} from '../csl-service/model/ReportResponse'
import { OrganisationalUnit } from 'src/csrs/model/organisationalUnit'

export class ReportService {

	constructor(private client: ReportServiceClient, private courseService: CourseService,
				private organisationalUnitService: OrganisationalUnitService, private cslService: CslServiceClient,
				private reportServicePageModelService: ReportServicePageModelService,
				private reportParameterFactory: ReportParameterFactory) {
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

	async getChooseCoursePage(selectedOrganisations: {name: string, id: string, abbreviation: string|undefined}[] | undefined): Promise<ChooseCoursesModel> {
		let requiredLearning: BasicCoursePageModel[] = []
		let organisationDepartments: string = ""
		if(selectedOrganisations){			
			organisationDepartments  = selectedOrganisations.length > 1 ? selectedOrganisations.map(organisation => organisation.abbreviation || organisation.name).join(" - ") : selectedOrganisations[0].name
			const hierarchy: OrganisationalUnit[] = (await Promise.all(selectedOrganisations.map(async organisation => await this.organisationalUnitService.getOrgHierarchy(parseInt(organisation.id))))).flat()

			const departmentCodes = hierarchy.map(o => o.code)
			const requiredLearningResponse = await this.courseService.getRequiredLearning(departmentCodes)
			requiredLearning = requiredLearningResponse.results
				.map(c => new BasicCoursePageModel(c.id, c.title))

		}
		
		const allCourses = (await this.courseService.getCourseDropdown())
			.map(course => new BasicCoursePageModel(course.id, course.name))

		const model = new ChooseCoursesModel(organisationDepartments, requiredLearning, allCourses)
		model.showRequiredLearningOption = requiredLearning.length > 0
		return model
	}

	async fetchCoursesWithIds(courseIds: string[]) {
		return (await this.courseService.getCourseDropdown())
			.filter(course => courseIds.includes(course.id))
	}

	async getCourseCompletionsReportGraphPage(session: CourseCompletionsSession): Promise<{pageModel: CourseCompletionsGraphModel, session: CourseCompletionsSession}> {		
		const params = this.reportParameterFactory.generateCourseAggregationsParams(session)
		const chart = await this.cslService.getCourseCompletionsAggregationsChart(params)
		return await this.buildPageModelFromChart(chart, session)
	}

	async submitExportRequest(session: CourseCompletionsSession): Promise<RequestCourseCompletionExportRequestResponse> {
		const params = this.reportParameterFactory.generateReportRequestParams(session)		
		return await this.cslService.postCourseCompletionsExportRequest(params)
	}

	async downloadCourseCompletionsReport(urlSlug: string): Promise<ReportResponse> {
		return await this.cslService.downloadCourseCompletionsReport(urlSlug)
	}

	private async buildPageModelFromChart(chart: Chart, session: CourseCompletionsSession) {
		const chartJsConfig = this.reportServicePageModelService.buildCourseCompletionsChart(chart)
		const tableModel = this.reportServicePageModelService.buildNoJSTable(chartJsConfig.noJSChart)
		let courseBreakdown: {text: string, format?: string | undefined}[][] = []
		if (session.courses && session.courses.length > 0) {
			courseBreakdown = this.reportServicePageModelService.buildCourseBreakdownTable(chart)
		}
		const filterSummary = await this.reportServicePageModelService.buildReportingFilterSummary(session)
		const graphPageModel = new CourseCompletionsGraphModel(chartJsConfig, tableModel,
			courseBreakdown, filterSummary, chart.hasRequest, session.timePeriod, session.startDay, session.startMonth,
			session.startYear, session.endDay, session.endMonth, session.endYear)
		session.chartData = graphPageModel.table
		return {
			pageModel: graphPageModel,
			session
		}
	}

}
