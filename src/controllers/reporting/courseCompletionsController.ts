import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {ReportService} from '../../report-service'
import {ChooseCoursesModel} from './model/chooseCoursesModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {plainToInstance} from 'class-transformer'
import {Controller} from '../controller'
import {CompoundRoleBase, mvpExportRole, mvpReportingRole} from '../../identity/identity'
import {fetchCourseCompletionSessionObject, saveCourseCompletionSessionObject} from './utils'
import * as moment from 'moment'
import { CourseCompletionsSession } from './model/courseCompletionsSession'
import { getCsvContentFromData } from '../../utils/dataToCsv'
import {COURSE_COMPLETIONS_FEEDBACK} from '../../config'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {roleCheckMiddleware} from '../middleware/roleCheckMiddleware'
import {CourseCompletionsGraphModel} from './model/courseCompletionsGraphModel'
import {CourseCompletionsFilterModel} from './model/courseCompletionsFilterModel'
import {BasicCourse} from '../../learning-catalogue/courseTypeAhead'

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
				roleCheckMiddleware(mvpExportRole.compoundRoles)
			]),
			postRequest("/download-source-data/js", this.submitExportRequestJs(), [
				roleCheckMiddleware(mvpExportRole.compoundRoles)
			]),
			getRequest("/download-report/:urlSlug", this.downloadExtract())
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
			if(session.organisationSelection === "allOrganisations" && !request.user?.isReportingAllOrganisations()){
				return response.render("page/unauthorised")
			}

			const pageData = await this.reportService.getCourseCompletionsReportGraphPage(session)
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
		}
		return session
	}

	private async submitExportRequest(request: Request, response: Response) {
		const session = fetchCourseCompletionSessionObject(request)!
		return await this.reportService.submitExportRequest(session)
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

	public downloadExtract() {
		return async (request: Request, response: Response) => {
			const reportResponse = await this.reportService.downloadCourseCompletionsReport(request.params.urlSlug)
			if (reportResponse.file === null) {
				if (reportResponse.code === 403) {
					return response.render("page/unauthorised")
				}
				if (reportResponse.code === 404) {
					return response.render("page/not-found")
				}
			} else {
				const report = reportResponse.file
				response.set(report.getHeaders())
				response.status(200)
				response.end(report.data)
			}
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
			const pageData = await this.reportService.getCourseCompletionsReportGraphPage(session)
			return saveCourseCompletionSessionObject(pageData.session, request, async () => {
				return response.render('page/reporting/courseCompletions/report', {pageModel: pageData.pageModel})
			})
		}
	}

	public renderChooseCourses() {
		return async (request: Request, response: Response) => {			
			const session = fetchCourseCompletionSessionObject(request)!			
			
			const selectedOrganisation = session.selectedOrganisation && parseInt(session.selectedOrganisation!.id)
						
			const pageModel = await this.reportService.getChooseCoursePage(selectedOrganisation)
			
			response.render('page/reporting/courseCompletions/choose-courses', {pageModel})
		}
	}

	public chooseCourses() {
		return async (request: Request, response: Response) => {
			const pageModel = plainToInstance(ChooseCoursesModel, response.locals.input as ChooseCoursesModel)
			let selectedCourses: BasicCourse[] = []
			if (['courseSearch', 'requiredLearning'].includes(pageModel.learning)) {
				const courseIds = pageModel.getCourseIdsFromSelection()
				selectedCourses = await this.reportService.fetchCoursesWithIds(courseIds)
				if (selectedCourses.length !== courseIds.length) {
					this.logger.debug("Course selections were invalid")
					const error = {fields: {learning: ['reporting.course_completions.validation.invalidCourseIds']}, size: 1}
					request.session!.sessionFlash = {
						error,
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
