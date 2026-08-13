import {NextFunction, Request, Response} from 'express'
import {LearningTagControllerBase} from './learningTagControllerBase'
import {getRequest, postRequestWithBody, Route} from '../route'
import {SearchForTagsModel} from './model/searchForTagsModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {SearchForCoursesModel} from './model/searchForCoursesModel'
import {plainToInstance} from 'class-transformer'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {CourseService} from '../../lib/courseService'
import {AssignCoursesToTagsModel} from './model/assignCoursesToTagsModel'
import {IUserRole, learningTagCourseManagerRole} from '../../identity/identity'

export class LearningTagAssignCoursesController extends LearningTagControllerBase {

	constructor(protected learningTagService: LearningTagService,
				private courseService: CourseService) {
		super('LearningTagController', learningTagService)
	}

	protected getRequiredRole(): IUserRole | undefined {
		return learningTagCourseManagerRole
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/assign-courses/select-learning-tags', this.getAssignLearningTagsToCourses()),
			postRequestWithBody('/assign-courses/select-learning-tags', this.assignLearningTagsToCourses(), {
				dtoClass: SearchForTagsModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getAssignLearningTagsToCourses()
				}
			}),
			getRequest('/assign-courses/select-courses', this.getAssignCoursesToLearningTags(), [this.validateTagSelection()]),
			postRequestWithBody('/assign-courses/select-courses', this.assignCoursesToLearningTags(), {
				dtoClass: SearchForCoursesModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getAssignCoursesToLearningTags()
				}
			}, [this.validateTagSelection()]),
		]
	}

	private getAssignLearningTagsToCourses() {
		return async(request: Request, response: Response) => {
			const tagsList = await this.learningTagService.getTypeahead()
			let pageModel = plainToInstance(SearchForTagsModel, response.locals.input as SearchForTagsModel) || new SearchForTagsModel([])
			pageModel.tagsList = tagsList
			response.render('page/learning-tags/assign/courses/search-for-tags.njk', {pageModel})
		}
	}

	private assignLearningTagsToCourses() {
		return async(request: Request, response: Response) => {
			const pageModel = plainToInstance(SearchForTagsModel, response.locals.input as SearchForTagsModel)
			let session = this.assignCoursesToTagsModelSession.fetchObjectFromSession(request)
			if (session === undefined) {
				session = new AssignCoursesToTagsModel([])
			}
			session.tagSearch = pageModel.tagSearch
			this.assignCoursesToTagsModelSession.saveObjectToSession(request, session)
			return response.redirect('/content-management/learning-tags/assign-courses/select-courses')
		}
	}

	private validateTagSelection() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let session = this.assignCoursesToTagsModelSession.fetchObjectFromSession(request)
			if (session === undefined || session.tagSearch === undefined || session.tagSearch.length === 0) {
				return response.redirect('/content-management/learning-tags/assign-courses/select-learning-tags')
			}
			next()
		}
	}

	private getAssignCoursesToLearningTags() {
		return async(request: Request, response: Response) => {
			const courseList = await this.courseService.getCourseDropdown()
			let pageModel = plainToInstance(SearchForCoursesModel, response.locals.input as SearchForCoursesModel) || new SearchForCoursesModel([])
			pageModel.courseList = courseList
			response.render('page/learning-tags/assign/courses/search-for-courses.njk', {pageModel})
		}
	}

	private assignCoursesToLearningTags() {
		return async(request: Request, response: Response) => {
			let session = this.assignCoursesToTagsModelSession.fetchObjectFromSession(request)!
			const pageModel = plainToInstance(SearchForCoursesModel, response.locals.input as SearchForCoursesModel)
			const coursesAssignedMessage = await this.learningTagService.assignCoursesToLearningTags(session.tagSearch, pageModel.courseSearch)
			this.assignCoursesToTagsModelSession.deleteObjectFromSession(request)
			request.session!.sessionFlash = { coursesAssignedMessage }
			return request.session!.save(() => {
				return response.redirect('/content-management/learning-tags/manage')
			})
		}
	}
}