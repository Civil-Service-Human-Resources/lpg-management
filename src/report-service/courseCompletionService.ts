import {CourseService} from 'lib/courseService'
import {BasicCoursePageModel, ChooseCoursesModel} from '../controllers/reporting/model/chooseCoursesModel'
import {CourseCompletionsGraphModel} from '../controllers/reporting/model/courseCompletionsGraphModel'
import {CslServiceClient} from '../csl-service/client'
import {CourseCompletionsSession} from '../controllers/reporting/model/courseCompletionsSession'
import {Chart} from './model/chart'
import {ReportServicePageModelService} from './reportServicePageModelService'
import {FormattedOrganisation} from '../csl-service/model/FormattedOrganisation'
import {Table} from './model/course-completions/table'
import {ReportParameterFactory} from './model/reportParameterFactory'

export class CourseCompletionService {

	constructor(private courseService: CourseService,
				private cslServiceClient: CslServiceClient,
				private reportServicePageModelService: ReportServicePageModelService,
				private reportParameterFactory: ReportParameterFactory) {
	}

	async getChooseCoursePage(selectedOrganisations: FormattedOrganisation[] | undefined): Promise<ChooseCoursesModel> {
		let requiredLearning: BasicCoursePageModel[] = []
		let organisationDepartments: string = ""
		if(selectedOrganisations){
			organisationDepartments  = selectedOrganisations.length > 1 ? selectedOrganisations.map(o => o.getAbbreviationOrName()).join(" - ") : selectedOrganisations[0].name
			const requiredLearningResponse = await this.cslServiceClient.getRequiredLearningForOrganisations(selectedOrganisations.map(o => o.id),)
			requiredLearning = requiredLearningResponse.getAllCourses()
		}

		const allCourses = (await this.courseService.getCourseDropdown())
			.map(course => new BasicCoursePageModel(course.id, course.name))

		return new ChooseCoursesModel(organisationDepartments, requiredLearning, allCourses)
	}

	async fetchCoursesWithIds(courseIds: string[]) {
		return (await this.courseService.getCourseDropdown())
			.map(c => {
				console.log(c)
				return c
			})
			.filter(course => courseIds.includes(course.id))
	}

	async getCourseCompletionsReportGraphPage(session: CourseCompletionsSession): Promise<{pageModel: CourseCompletionsGraphModel, session: CourseCompletionsSession}> {
		const params = this.reportParameterFactory.generateCourseAggregationsParams(session)
		const chart = await this.cslServiceClient.getCourseCompletionsAggregationsChart(params)
		return await this.buildPageModelFromChart(chart, session)
	}

	private async buildPageModelFromChart(chart: Chart, session: CourseCompletionsSession) {
		const chartJsConfig = this.reportServicePageModelService.buildCourseCompletionsChart(chart)
		const tableModel = this.reportServicePageModelService.buildNoJSTable(chartJsConfig.noJSChart)
		let courseBreakdowns: Table[] = []
		if (session.courses && session.courses.length > 0) {
			courseBreakdowns = this.reportServicePageModelService.buildCourseBreakdownTable(chart)
		}
		const filterSummary = await this.reportServicePageModelService.buildReportingFilterSummary(session)
		const graphPageModel = new CourseCompletionsGraphModel(chartJsConfig, tableModel,
			courseBreakdowns, filterSummary, chart.hasRequest, session.timePeriod, session.startDay, session.startMonth,
			session.startYear, session.endDay, session.endMonth, session.endYear)
		session.chartData = graphPageModel.table
		return {
			pageModel: graphPageModel,
			session
		}
	}

}
