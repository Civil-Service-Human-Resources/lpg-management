import {CourseCompletionsControllerBaseBase} from './courseCompletionsControllerBase'
import {getRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {ReportService} from '../../report-service'
import {ChooseCoursesModel} from './model/chooseCoursesModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {plainToInstance} from 'class-transformer'
import {CourseCompletionsSession} from './model/courseCompletionsSession'

export class CourseCompletionsController extends CourseCompletionsControllerBaseBase {

	constructor(
		protected reportService: ReportService,
	) {
		super('CourseCompletionsController', reportService)
	}

	private checkForOrgIdsInSessionMiddleware() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const session = plainToInstance(CourseCompletionsSession,
				request.session!.courseCompletions as CourseCompletionsSession)
			if (session === undefined || session.organisationIds === undefined ||
				session.organisationIds.length === 0) {
				this.logger.debug(`session: ${session}`)
				return response.redirect("/reporting/course-completions/choose-organisation")
			}
			next()
		}
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/', this.renderReport()),
			getRequest('/choose-courses', this.renderChooseCourses(),
				[this.checkForOrgIdsInSessionMiddleware()]),
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
			request.session!.courseCompletions.courseIds = undefined
			request.session!.save(async () => {
				const pageModel = await this.reportService.getChooseCoursePage()
				response.render('page/reporting/courseCompletions/choose-courses', {pageModel})
			})
		}
	}

	public chooseCourses() {
		return async (request: Request, response: Response) => {
			const pageModel = plainToInstance(ChooseCoursesModel, request.body as ChooseCoursesModel)
			const courseIds = pageModel.getCourseIdsFromSelection()
			const session = plainToInstance(CourseCompletionsSession,
				request.session!.courseCompletions as CourseCompletionsSession)
			session.courseIds = courseIds
			request.session!.save(() => {
				response.redirect('/reporting/course-completions')
			})
		}
	}
}
