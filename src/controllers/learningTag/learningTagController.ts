import {NextFunction, Request, Response} from 'express'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {learningTagArchiveRole, learningTagCourseManagerRole} from '../../identity/identity'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {LearningTagPageModel} from './model/learningTagPageModel'
import {compoundRoleCheckMiddleware} from '../middleware/roleCheckMiddleware'
import {PaginationService} from '../../lib/paginationService'
import {plainToInstance} from 'class-transformer'
import {LearningTagCourseSearchParams} from './model/learningTagCourseSearchParams'
import {LearningTagHyperlinksSearchParams} from './model/learningTagHyperlinksSearchParams'
import {RemoveCoursesFromLearningTagPageModel} from './model/removeCoursesFromLearningTagPageModel'
import {RemoveHyperlinksFromLearningTagPageModel} from './model/removeHyperlinksFromLearningTagPageModel'
import {SessionableObjectService} from '../reporting/utils'
import {AssignCoursesToTagsModel} from './model/assignCoursesToTagsModel'
import {LearningTagControllerBase} from './learningTagControllerBase'

export class LearningTagController extends LearningTagControllerBase {

	protected assignCoursesToTagsModelSession = new SessionableObjectService("assignCoursesToTagsModel", AssignCoursesToTagsModel)

	constructor(protected learningTagService: LearningTagService,
				private pagination: PaginationService) {
		super('LearningTagController', learningTagService)
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
			getRequest('/:learningTagId/courses', this.getCourses(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequest('/:learningTagId/courses/remove/:courseId', this.removeCourse(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/courses/remove', this.bulkRemoveCourses(), {
				dtoClass: RemoveCoursesFromLearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getCourses()
				}
			}, [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequest('/:learningTagId/hyperlinks/remove/:hyperlinkId', this.removeHyperlink(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/hyperlinks/remove', this.bulkRemoveHyperlinks(), {
				dtoClass: RemoveHyperlinksFromLearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getCourses()
				}
			}, [compoundRoleCheckMiddleware(learningTagCourseManagerRole)])
		]
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
			this.assignCoursesToTagsModelSession.deleteObjectFromSession(request)
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
			let pageModel: RemoveCoursesFromLearningTagPageModel | undefined
			let hyperlinksPageModel: RemoveHyperlinksFromLearningTagPageModel | undefined
			if (response.locals.input instanceof RemoveCoursesFromLearningTagPageModel) {
				pageModel = response.locals.input
			} else if (response.locals.input instanceof RemoveHyperlinksFromLearningTagPageModel) {
				hyperlinksPageModel = response.locals.input
			}
			const params = plainToInstance(LearningTagCourseSearchParams, request.query)
			params.learningTagId = response.locals.learningTag.id
			const results = await this.learningTagService.getCoursesPage(response.locals.learningTag.id, params)
			const pagePagination = this.pagination.getPagination(params, results)
			if (pageModel === undefined) {
				pageModel = new RemoveCoursesFromLearningTagPageModel(results.results, pagePagination)
			} else {
				pageModel.setResults(results.results)
				pageModel.pagePagination = pagePagination
			}
			const hyperlinkParams = plainToInstance(LearningTagHyperlinksSearchParams, request.query)
			hyperlinkParams.learningTagId = response.locals.learningTag.id
			const hyperlinks = await this.learningTagService.getHyperlinksPage(response.locals.learningTag.id, hyperlinkParams)
			const hyperlinksPagination = this.pagination.getPagination(hyperlinkParams, hyperlinks)
			if (hyperlinksPageModel === undefined) {
				hyperlinksPageModel = new RemoveHyperlinksFromLearningTagPageModel(hyperlinks.results, hyperlinksPagination)
			} else {
				hyperlinksPageModel.setResults(hyperlinks.results)
				hyperlinksPageModel.pagePagination = hyperlinksPagination
			}
			response.render('page/learning-tags/view-courses.njk', {pageModel, hyperlinksPageModel, hyperlinks, hyperlinksPagination})
		}
	}

	private removeCourses = async (request: Request, response: Response, model: RemoveCoursesFromLearningTagPageModel) => {
		const learningTagId = response.locals.learningTag.id as number
		const removeCourseResults = await this.learningTagService.removeCourses(learningTagId, model.getCourseIds())
		request.session!.sessionFlash = { removeCourseResults }
		return request.session!.save(() => {
			response.redirect(`/content-management/learning-tags/${learningTagId}/courses`)
		})
	}

	private removeCourse() {
		return async(request: Request, response: Response) => {
			const model = new RemoveCoursesFromLearningTagPageModel()
			model.courseIds = [request.params.courseId]
			return await this.removeCourses(request, response, model)
		}
	}

	private bulkRemoveCourses() {
		return async(request: Request, response: Response) => {
			const model = plainToInstance(RemoveCoursesFromLearningTagPageModel, response.locals.input as RemoveCoursesFromLearningTagPageModel)
			return await this.removeCourses(request, response, model)
		}
	}

	private removeHyperlinks = async (request: Request, response: Response, model: RemoveHyperlinksFromLearningTagPageModel) => {
		const learningTagId = response.locals.learningTag.id as number
		const removeHyperlinkResults = await this.learningTagService.removeHyperlinks(learningTagId, model.getHyperlinkIds())
		request.session!.sessionFlash = { removeHyperlinkResults }
		return request.session!.save(() => {
			response.redirect(`/content-management/learning-tags/${learningTagId}/courses?linkPage=1`)
		})
	}

	private removeHyperlink() {
		return async(request: Request, response: Response) => {
			const model = new RemoveHyperlinksFromLearningTagPageModel()
			model.hyperlinkIds = [request.params.hyperlinkId]
			return await this.removeHyperlinks(request, response, model)
		}
	}

	private bulkRemoveHyperlinks() {
		return async(request: Request, response: Response) => {
			const model = plainToInstance(RemoveHyperlinksFromLearningTagPageModel, response.locals.input as RemoveHyperlinksFromLearningTagPageModel)
			return await this.removeHyperlinks(request, response, model)
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
