import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {ChooseCoursesModel} from './model/chooseCoursesModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {plainToInstance} from 'class-transformer'
import {Controller} from '../controller'
import {IUserRole, mvpExportRole, mvpReportingRole} from '../../identity/identity'
import {fetchCourseCompletionSessionObject, saveCourseCompletionSessionObject} from './utils'
import * as moment from 'moment'
import {CourseCompletionsSession} from './model/courseCompletionsSession'
import {getCsvContentFromData} from '../../utils/dataToCsv'
import {COURSE_COMPLETIONS_FEEDBACK} from '../../config'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {roleCheckMiddleware} from '../middleware/roleCheckMiddleware'
import {CourseCompletionsGraphModel} from './model/courseCompletionsGraphModel'
import {CourseCompletionsFilterModel} from './model/courseCompletionsFilterModel'
import {BasicCourse} from '../../learning-catalogue/courseTypeAhead'
import {ChooseOrganisationsModel} from './model/chooseOrganisationsModel'
import {OrganisationPageModelService} from './organisationPageModelService'
import {CourseCompletionService} from '../../report-service/courseCompletionService'
import {ReportExportService} from './reportExportService'
import {Report} from './Report'

export class CourseCompletionsController extends Controller {

	constructor(protected courseCompletionService: CourseCompletionService,
				protected reportExportService: ReportExportService,
				protected organisationPageModelService: OrganisationPageModelService) {
		super("/reporting/course-completions", 'CourseCompletionsController')
	}

	protected getRequiredRole(): IUserRole {
		return mvpReportingRole
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

	private feedbackBannerMiddleware() {
		return async (request: Request, response: Response, next: NextFunction) => {
			response.locals.feedbackBanner = { message: COURSE_COMPLETIONS_FEEDBACK.MESSAGE }
			next()
		}
	}

	protected getControllerMiddleware(): ((req: Request, res: Response, next: NextFunction) => void)[] {
		return [...super.getControllerMiddleware(), this.feedbackBannerMiddleware()]
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/', this.renderReport(), [this.checkForCourseIdsInSessionMiddleware()]),
			postRequestWithBody('/', this.updateReportFilters(), {
				dtoClass: CourseCompletionsFilterModel,
				onError: {
					behaviour: BehaviourOnError.REDIRECT,
					path: '/reporting/course-completions',
					pageModelKey: 'filterModelErrors'
				}
			}, [this.checkForCourseIdsInSessionMiddleware()]),
			getRequest('/choose-organisation', this.renderChooseOrganisations()),
			postRequestWithBody('/choose-organisation', this.chooseOrganisations(),
				{
					dtoClass: ChooseOrganisationsModel,
					onError: {
						behaviour: BehaviourOnError.REDIRECT,
						path: '/reporting/course-completions/choose-organisation'
					}
				}),
			getRequest('/choose-courses', this.renderChooseCourses(), [this.checkForOrgIdsInSessionMiddleware()]),
			postRequestWithBody('/choose-courses', this.chooseCourses(),
				{
					dtoClass: ChooseCoursesModel,
					onError: {
						behaviour: BehaviourOnError.REDIRECT,
						path: '/reporting/course-completions/choose-courses'
					}
				}, [this.checkForOrgIdsInSessionMiddleware()]),
			postRequest("/chart-csv", this.downloadDataAsCsv()),
			getRequest("/feedback", this.feedback()),
			postRequest("/download-source-data", this.submitExportRequestNoJs(), [
				roleCheckMiddleware(mvpExportRole)
			]),
			postRequest("/download-source-data/js", this.submitExportRequestJs(), [
				roleCheckMiddleware(mvpExportRole)
			]),
			getRequest("/download-report/:urlSlug", this.reportExportService.downloadExtract(Report.COURSE_COMPLETIONS))
		]
	}

	public feedback() {
		return async (request: Request, response: Response) => {
			const currentUserDepartment = request.user!.organisationalUnit! as OrganisationalUnit
			this.logger.info(`User in department "${currentUserDepartment.name}" submitting reporting feedback`)
			response.redirect(`${COURSE_COMPLETIONS_FEEDBACK.URL}?department=${currentUserDepartment.name}`)
		}
	}

	public renderReport() {
		return async (request: Request, response: Response) => {
			const session = fetchCourseCompletionSessionObject(request)!
			const pageData = await this.courseCompletionService.getCourseCompletionsReportGraphPage(session)

			const errors = request.session!.filterModelErrors
			if (errors) {
				pageData.pageModel.updateWithFilters(errors)
				delete request.session!.filterModelErrors
			}
			return saveCourseCompletionSessionObject(pageData.session, request, () => {
				return response.render('page/reporting/courseCompletions/report', {pageModel: pageData.pageModel})
			})
		}
	}

	private removeValuesFromSession(request: Request, filterPageModel: CourseCompletionsGraphModel) {
		const session = fetchCourseCompletionSessionObject(request)!
		const remove = (filterPageModel.remove || request.query["remove"] || "") as string
		if (remove !== "") {
			if (remove.startsWith("courseId")) {
				const courseIdToRemove = remove.split(",")[1]
				session.courses = session.courses!.filter(course => course.id !== courseIdToRemove)
			}
			if (remove.startsWith("organisationId")) {
				const organisationIdToRemove: number = parseInt(remove.split(",")[1])
				session.selectedOrganisations = session.selectedOrganisations!.filter(organisation => organisation.id !== organisationIdToRemove)
			}
		}
		return session
	}

	private async submitExportRequest(request: Request, response: Response) {
		const session = fetchCourseCompletionSessionObject(request)!
		return await this.reportExportService.submitCourseCompletionExportRequest(session)
	}

	public submitExportRequestNoJs() {
		return async (request: Request, response: Response) => {
			await this.submitExportRequest(request, response)
			return response.redirect('/reporting/course-completions')
		}
	}

	public submitExportRequestJs() {
		return async (request: Request, response: Response) => {
			await this.submitExportRequest(request, response)
			response.status(200)
			return response.send()
		}
	}

	public updateReportFilters() {
		return async (request: Request, response: Response) => {
			const pageModel = plainToInstance(CourseCompletionsGraphModel, response.locals.input as CourseCompletionsGraphModel)
			const session = this.removeValuesFromSession(request, pageModel)
			session.updateWithFilterPageModel(pageModel)
			if (!session.hasSelectedCourses()) {
				return saveCourseCompletionSessionObject(session, request, async () => {
					return response.redirect('/reporting/course-completions/choose-courses')
				})
			}
			if(!session.hasSelectedOrganisations()) {
				return saveCourseCompletionSessionObject(session, request, async () => {
					return response.redirect('/reporting/course-completions/choose-organisation')
				})
			}

			const pageData = await this.courseCompletionService.getCourseCompletionsReportGraphPage(session)
			return saveCourseCompletionSessionObject(pageData.session, request, async () => {
				return response.render('page/reporting/courseCompletions/report', {pageModel: pageData.pageModel})
			})
		}
	}

	public renderChooseOrganisations() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.organisationPageModelService.renderChooseOrganisation(request)
			response.render('page/reporting/courseCompletions/choose-organisation', {pageModel})
		}
	}

	public chooseOrganisations() {
		return async (request: Request, response: Response) => {
			let session = fetchCourseCompletionSessionObject(request)
			await this.organisationPageModelService.handleSubmit(request, response, session)
			saveCourseCompletionSessionObject(session, request, async () => {
				if (!response.headersSent) {
					if (session.hasSelectedCourses()) {
						response.redirect(`/reporting/course-completions`)
					} else {
						response.redirect(`/reporting/course-completions/choose-courses`)
					}
				}
			})
		}
	}

	public renderChooseCourses() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.courseCompletionService.getChooseCoursePage(request)
			response.render('page/reporting/courseCompletions/choose-courses', {pageModel})
		}
	}

	public chooseCourses() {
		return async (request: Request, response: Response) => {
			const pageModel = plainToInstance(ChooseCoursesModel, response.locals.input as ChooseCoursesModel)

			let selectedCourses: BasicCourse[] = []
			if (['courseSearch', 'requiredLearning'].includes(pageModel.learning)) {
				const courseIds = pageModel.getCourseIdsFromSelection()
				selectedCourses = await this.courseCompletionService.fetchCoursesWithIds(courseIds)
				if (selectedCourses.length !== courseIds.length) {
					this.logger.debug("Course selections were invalid")
					const errors = {fields: {learning: ['reporting.course_completions.validation.invalidCourseIds']}, size: 1}
					request.session!.sessionFlash = {
						errors,
					}
					return request.session!.save(() => {
						response.redirect('/reporting/course-completions/choose-courses')
					})
				}
			}
			const session = fetchCourseCompletionSessionObject(request)!
			session.courses = selectedCourses
			session.learningSelection = pageModel.learning
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
