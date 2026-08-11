import {NextFunction, Request, Response} from 'express'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {Controller} from '../controller'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {IUserRole, learningTagArchiveRole, learningTagManagerRole} from '../../identity/identity'
import * as asyncHandler from 'express-async-handler'
import {LearningTag} from '../../learning-catalogue/model/learningTag/learningTag'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {LearningTagPageModel} from './model/learningTagPageModel'
import {compoundRoleCheckMiddleware} from '../middleware/roleCheckMiddleware'
import {PaginationService} from '../../lib/paginationService'
import {plainToInstance} from 'class-transformer'
import {LearningTagCourseSearchParams} from './model/learningTagCourseSearchParams'
import {RemoveCoursesFromLearningTagPageModel} from './model/removeCoursesFromLearningTagPageModel'

export class LearningTagController extends Controller {

	constructor(private learningTagService: LearningTagService,
				private pagination: PaginationService) {
		super('/content-management/learning-tags', 'LearningTagController')
		this.getLearningTagFromRouterParamAndSetOnLocals()
	}

	protected getRequiredRole(): IUserRole | undefined {
		return learningTagManagerRole
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/manage', this.getList()),
			getRequest('/:learningTagId/overview', this.get()),
			getRequest('/', this.getCreate()),
			postRequestWithBody('/', this.create(), {
				dtoClass: LearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getCreate()
				}
			}),
			getRequest('/:learningTagId', this.getEdit()),
			postRequestWithBody('/:learningTagId', this.edit(), {
				dtoClass: LearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getEdit()
				}
			}),
			getRequest('/:learningTagId/unlink-parent-confirm', this.getUnlinkParent()),
			postRequest('/:learningTagId/unlink-parent', this.unlinkParent()),
			getRequest('/:learningTagId/archive-confirm', this.getArchive(), [compoundRoleCheckMiddleware(learningTagArchiveRole)]),
			postRequest('/:learningTagId/archive', this.archive(), [compoundRoleCheckMiddleware(learningTagArchiveRole)]),
			getRequest('/:learningTagId/unarchive-confirm', this.getUnarchive(), [compoundRoleCheckMiddleware(learningTagArchiveRole)]),
			postRequest('/:learningTagId/unarchive', this.unarchive(), [compoundRoleCheckMiddleware(learningTagArchiveRole)]),

			postRequest('/:learningTagId/unlink-parent', this.unlinkParent()),
			getRequest('/:learningTagId/courses', this.getCourses()),
			postRequest('/:learningTagId/courses/remove/:courseId', this.removeCourse()),
			postRequestWithBody('/:learningTagId/courses/remove', this.bulkRemoveCourses(), {
				dtoClass: RemoveCoursesFromLearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getCourses()
				}
			})
		]
	}

	private getLearningTagFromRouterParamAndSetOnLocals() {
		this.router.param('learningTagId', asyncHandler(async (req: Request, res: Response, next: NextFunction, learningTagId: number) => {
				const learningTag: LearningTag = await this.learningTagService.getLearningTag(learningTagId)
				if (learningTag) {
					res.locals.learningTag = learningTag
					next()
				} else {
					res.status(404)
					return res.render("page/not-found")
				}
			})
		)
	}

	private getPageModel = async (request: Request, response: Response) => {
		let pageModel = response.locals.input as LearningTagPageModel
		const learningTag = response.locals.learningTag
		if (pageModel === undefined) {
			pageModel = await this.learningTagService.getPageModel(response.locals.learningTag, true)
		} else {
			pageModel.id = learningTag === undefined ? undefined : learningTag.id
			pageModel.parentTags = await this.learningTagService.getTypeahead()
			request.session!.pageModel = undefined
		}
		return pageModel
	}

	private validatePageModel = async (request: Request, response: Response) => {
		const pageModel = await this.getPageModel(request, response)
		pageModel.validate()
		return pageModel
	}

	public getList() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const learningTags = await this.learningTagService.getTree()
			response.render('page/learning-tags/manage-learning-tags.njk', {learningTags})
		}
	}

	private get() {
		return function(request: Request, response: Response, next: NextFunction) {
			response.render('page/learning-tags/learning-tag-overview.njk')
		}
	}

	private getCreate() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const pageModel = await this.getPageModel(request, response)
			response.render('page/learning-tags/add-learning-tag.njk', {pageModel})
		}
	}

	private create() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const pageModel = await this.validatePageModel(request, response)
			if (pageModel.hasErrors()) {
				return response.render('page/learning-tags/add-learning-tag.njk', {pageModel})
			}
			const newLearningTag = await this.learningTagService.create(pageModel)
			request.session!.sessionFlash = {learningTagNotification: 'learningTags.notification.created'}
			response.redirect(`/content-management/learning-tags/${newLearningTag.id}/overview`)
		}
	}

	private getEdit() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const pageModel = await this.getPageModel(request, response)
			response.render('page/learning-tags/edit-learning-tag.njk', {pageModel})
		}
	}

	public edit() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.validatePageModel(request, response)
			if (pageModel.hasErrors()) {
				return response.render('page/learning-tags/edit-learning-tag.njk', {pageModel})
			}
			let learningTag = response.locals.learningTag
			this.logger.debug(`Updating learning tag: ${learningTag.id}`)

			await this.learningTagService.update(learningTag, pageModel)

			response.redirect(`/content-management/learning-tags/${learningTag.id}/overview`)
		}
	}

	public unlinkParent(){
		return async(request: Request, response: Response) => {
			let learningTag = response.locals.learningTag
			this.logger.debug(`Unlinking parent tag from tag: ${learningTag.id}`)
			const pageModel = await this.learningTagService.getPageModel(learningTag)
			pageModel.parentId = null
			learningTag  = await this.learningTagService.update(learningTag, pageModel)
			response.redirect(`/content-management/learning-tags/${learningTag.id}/overview`)
		}
	}

	public getUnlinkParent(){
		return async (request: Request, response: Response) => {
			response.render('page/learning-tags/remove-parent.njk')
		}
	}

	private getCourses() {
		return async(request: Request, response: Response) => {
			const params = plainToInstance(LearningTagCourseSearchParams, request.query)
			params.learningTagId = response.locals.learningTag.id
			const results = await this.learningTagService.getCoursesPage(response.locals.learningTag.id, params)
			const pagePagination = this.pagination.getPagination(params, results)
			response.render('page/learning-tags/view-courses.njk', {results, pagePagination})
		}
	}

	private removeCourses = async (request: Request, response: Response, model: RemoveCoursesFromLearningTagPageModel) => {
		const learningTagId = response.locals.learningTag.id as number
		// const removeCourseResults = await this.learningTagService.removeCourses(learningTagId, model)
		const removeCourseResults = {
			successfulIds: ["", "", ""]
		}
		request.session!.sessionFlash = { removeCourseResults }
		return request.session!.save(() => {
			response.redirect(`/content-management/learning-tags/${learningTagId}/courses`)
		})
	}

	private removeCourse() {
		return async(request: Request, response: Response) => {
			const model = new RemoveCoursesFromLearningTagPageModel([request.params.courseId])
			return this.removeCourses(request, response, model)
		}
	}

	private bulkRemoveCourses() {
		return async(request: Request, response: Response) => {
			const model = plainToInstance(RemoveCoursesFromLearningTagPageModel, request.query)
			return this.removeCourses(request, response, model)
		}
	}

	public archive() {
		return async(request: Request, response: Response) => {
			let learningTag = response.locals.learningTag
			await this.learningTagService.archive(learningTag.id)
			request.session!.sessionFlash = {learningTagNotification: 'learningTags.notification.archived'}
			response.redirect(`/content-management/learning-tags/${learningTag.id}/overview`)
		}
	}

	public getArchive() {
		return async(request: Request, response: Response) => {
			response.render('page/learning-tags/archive.njk')
		}
	}

	public unarchive() {
		return async(request: Request, response: Response) => {
			let learningTag = response.locals.learningTag
			await this.learningTagService.unarchive(learningTag.id)
			request.session!.sessionFlash = {learningTagNotification: 'learningTags.notification.unarchived'}
			response.redirect(`/content-management/learning-tags/${learningTag.id}/overview`)
		}
	}

	public getUnarchive() {
		return async(request: Request, response: Response) => {
			response.render('page/learning-tags/unarchive.njk')
		}
	}
}
