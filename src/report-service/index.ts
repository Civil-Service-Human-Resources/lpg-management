import {ReportServiceClient} from './reportServiceClient'
import {CourseService} from 'lib/courseService'
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
import {FormattedOrganisation} from '../csl-service/model/FormattedOrganisation'
import {ChooseOrganisationsModel} from '../controllers/reporting/model/chooseOrganisationsModel'
import {CslService} from '../csl-service/service/cslService'

export class ReportService {

	constructor(private client: ReportServiceClient, private courseService: CourseService,
				private cslServiceClient: CslServiceClient, private cslService: CslService,
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

	async getChooseCoursePage(selectedOrganisations: FormattedOrganisation[] | undefined): Promise<ChooseCoursesModel> {
		let requiredLearning: BasicCoursePageModel[] = []
		let organisationDepartments: string = ""
		if(selectedOrganisations){
			organisationDepartments  = selectedOrganisations.length > 1 ? selectedOrganisations.map(organisation => organisation.abbreviation || organisation.name).join(" - ") : selectedOrganisations[0].name
			const requiredLearningResponse = await this.cslServiceClient.getRequiredLearningForOrganisations(selectedOrganisations.map(o => o.id),)
			requiredLearning = requiredLearningResponse.getAllCourses()
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
		const chart = await this.cslServiceClient.getCourseCompletionsAggregationsChart(params)
		return await this.buildPageModelFromChart(chart, session)
	}

	async submitExportRequest(session: CourseCompletionsSession): Promise<RequestCourseCompletionExportRequestResponse> {
		const params = this.reportParameterFactory.generateReportRequestParams(session)
		return await this.cslServiceClient.postCourseCompletionsExportRequest(params)
	}

	async downloadCourseCompletionsReport(urlSlug: string): Promise<ReportResponse> {
		return await this.cslServiceClient.downloadCourseCompletionsReport(urlSlug)
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

	async getChooseOrganisationPage(user: any) {
		const formattedOtherOrganisations = await this.getOrganisationsForUser(user)
		const pageModel = new ChooseOrganisationsModel({
			name: user.organisationalUnit.name,
			id: user.organisationalUnit.id
		}, formattedOtherOrganisations)

		pageModel.showWholeCivilServiceOption = user.isReportingAllOrganisations()
		return pageModel
	}

	async getOrganisationsForUser(user: any): Promise<FormattedOrganisation[]> {
		return await this.cslService.getOrganisationTypeaheadForUser(user)
	}
}
