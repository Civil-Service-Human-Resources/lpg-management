import {getRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {ReportService} from '../../report-service'
import {ChooseCoursesModel} from './model/chooseCoursesModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {plainToInstance} from 'class-transformer'
import {CourseCompletionsSession} from './model/courseCompletionsSession'
import {Controller} from '../controller'
import {CompoundRoleBase, mvpReportingRole} from '../../identity/identity'

export class CourseCompletionsController extends Controller {

	constructor(protected reportService: ReportService,) {
		super("/reporting/course-completions", 'CourseCompletionsController')
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return mvpReportingRole.compoundRoles
	}

	private fetchSessionObject(req: Request): CourseCompletionsSession | undefined {
		return req.session ? plainToInstance(CourseCompletionsSession,
				req.session.courseCompletions as CourseCompletionsSession) : undefined
	}

	private saveSessionObject(sessionObject: CourseCompletionsSession, req: Request, cb: () => void): void {
		req.session!.courseCompletions = sessionObject
		req.session!.save(() => {
			cb()
		})
	}

	private checkForOrgIdsInSessionMiddleware() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const session = this.fetchSessionObject(request)
			if (session === undefined || !session.hasSelectedOrganisations()) {
				return response.redirect("/reporting/course-completions/choose-organisation")
			}
			next()
		}
	}

	private checkForCourseIdsInSessionMiddleware() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const session = this.fetchSessionObject(request)
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
				}, [this.checkForOrgIdsInSessionMiddleware()])
		]
	}

	public renderReport() {
		return async (request: Request, response: Response) => {
			response.render('page/reporting/courseCompletions/report')
		}
	}

	public renderChooseCourses() {
		return async (request: Request, response: Response) => {
			const session = this.fetchSessionObject(request)!
			session.courseIds = []
			const selectedOrganisation = session.organisationIds![0]
			this.saveSessionObject(session, request, async () => {
				const pageModel = await this.reportService.getChooseCoursePage(selectedOrganisation)
				response.render('page/reporting/courseCompletions/choose-courses', {pageModel})
			})
		}
	}

	public chooseCourses() {
		return async (request: Request, response: Response) => {
			const pageModel = plainToInstance(ChooseCoursesModel, request.body as ChooseCoursesModel)
			const courseIds = pageModel.getCourseIdsFromSelection()
			if (!await this.reportService.validateCourseSelections(courseIds)) {
				const error = {fields: {learning: ['reporting.course_completions.validation.invalidCourseIds']}, size: 1}
				request.session!.sessionFlash = {
					error,
				}
				return request.session!.save(() => {
					response.redirect('/reporting/course-completions/choose-courses')
				})
			}
			const session = this.fetchSessionObject(request)!
			session.courseIds = courseIds
			this.saveSessionObject(session, request, async () => {
				response.redirect('/reporting/course-completions')
			})
		}
	}
}
