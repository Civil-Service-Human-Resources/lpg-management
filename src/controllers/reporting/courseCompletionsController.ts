import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {ReportService} from '../../report-service'
import {ChooseCoursesModel} from './model/chooseCoursesModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {plainToInstance} from 'class-transformer'
import {Controller} from '../controller'
import {CompoundRoleBase, mvpReportingRole} from '../../identity/identity'
import {fetchCourseCompletionSessionObject, saveCourseCompletionSessionObject} from './utils'
import {GetCourseAggregationParameters} from '../../report-service/model/getCourseAggregationParameters'
import moment = require('moment')
import { CourseCompletionsSession } from './model/courseCompletionsSession'
import { getCsvContentFromData } from 'src/utils/dataToCsv'

export class CourseCompletionsController extends Controller {

	constructor(protected reportService: ReportService,) {
		super("/reporting/course-completions", 'CourseCompletionsController')
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return mvpReportingRole.compoundRoles
	}

	private checkForOrgIdsInSessionMiddleware() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const session = fetchCourseCompletionSessionObject(request)
			if (session === undefined || !session.hasSelectedOrganisations()) {
				return response.redirect("/reporting/course-completions/choose-organisation")
			}
			next()
		}
	}

	private checkForCourseIdsInSessionMiddleware() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const session = fetchCourseCompletionSessionObject(request)
			if (session === undefined || !session.hasSelectedCourses()) {
				return response.redirect("/reporting/course-completions/choose-courses")
			}
			next()
		}
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/', this.renderReport(), [this.checkForCourseIdsInSessionMiddleware()]),
			getRequest('/choose-courses', this.renderChooseCourses(), [this.checkForOrgIdsInSessionMiddleware()]),
			postRequestWithBody('/choose-courses', this.chooseCourses(),
				{
					dtoClass: ChooseCoursesModel,
					onError: {
						behaviour: BehaviourOnError.REDIRECT,
						path: '/reporting/course-completions/choose-courses'
					}
				}, [this.checkForOrgIdsInSessionMiddleware()]),

			postRequest("/chart-csv", this.downloadDataAsCsv())

		]
	}

	public renderReport() {
		return async (request: Request, response: Response) => {
			const session = fetchCourseCompletionSessionObject(request)!
			const pageModel = await this.reportService.getCourseCompletionsReportGraphPage(GetCourseAggregationParameters.createForDay(
				session.courseIds!, session!.allOrganisationIds!.map(n => n.toString())
			))
			
			session.chartData = pageModel.table
			saveCourseCompletionSessionObject(session, request, () => {})
			
			response.render('page/reporting/courseCompletions/report', {pageModel,
				backButton: '/reporting/course-completions/choose-courses'})
		}
	}

	public renderChooseCourses() {
		return async (request: Request, response: Response) => {
			const session = fetchCourseCompletionSessionObject(request)!
			const selectedOrganisation = session.selectedOrganisationId!
			const pageModel = await this.reportService.getChooseCoursePage(selectedOrganisation)
			response.render('page/reporting/courseCompletions/choose-courses', {pageModel,
				backButton: '/reporting/course-completions/choose-organisation'})
		}
	}

	public chooseCourses() {
		return async (request: Request, response: Response) => {
			const pageModel = plainToInstance(ChooseCoursesModel, response.locals.input as ChooseCoursesModel)
			const courseIds = pageModel.getCourseIdsFromSelection()
			if (!await this.reportService.validateCourseSelections(courseIds)) {
				this.logger.debug("Course selections were invalid")
				const error = {fields: {learning: ['reporting.course_completions.validation.invalidCourseIds']}, size: 1}
				request.session!.sessionFlash = {
					error,
				}
				return request.session!.save(() => {
					response.redirect('/reporting/course-completions/choose-courses')
				})
			}
			const session = fetchCourseCompletionSessionObject(request)!
			session.courseIds = courseIds
			saveCourseCompletionSessionObject(session, request, async () => {
				response.redirect('/reporting/course-completions')
			})
		}
	}

	public downloadDataAsCsv(){
		return async (request: Request, response: Response) => {
			const session: CourseCompletionsSession | undefined = fetchCourseCompletionSessionObject(request)
			
			const chartData: {text: string}[][] | undefined = session?.chartData
			const fields = [
				{name: "time", type: "text"},
				{name: "completions", type: "number"}
			]
			const csvContent = chartData ? getCsvContentFromData(chartData, fields) : ""
			
			response.writeHead(200, this.getCsvResponseHeaders())
			response.end(csvContent)
		}
	}

	private getCsvResponseHeaders(){
		return {
			'Content-type': 'text/csv',
			'Content-disposition': `attachment;filename=course-completions-${moment().toISOString()}.csv`,
		}
	}
}
