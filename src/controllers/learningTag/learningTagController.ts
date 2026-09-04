import {NextFunction, Request, Response} from 'express'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {learningTagArchiveRole, learningTagCourseManagerRole} from '../../identity/identity'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {LearningTagPageModel} from './model/learningTagPageModel'
import {compoundRoleCheckMiddleware} from '../middleware/roleCheckMiddleware'
import {PaginationService} from '../../lib/paginationService'
import {ClassConstructor, plainToInstance} from 'class-transformer'
import {LearningTagCourseSearchParams} from './model/learningTagCourseSearchParams'
import {RemoveCoursesFromLearningTagPageModel} from './model/removeCoursesFromLearningTagPageModel'
import {RemoveHyperlinksFromLearningTagPageModel} from './model/removeHyperlinksFromLearningTagPageModel'
import {LearningTagControllerBase} from './learningTagControllerBase'
import {HyperlinkPageModel} from './model/hyperlinkPageModel'
import {Hyperlink} from '../../learning-catalogue/model/learningTag/hyperlink'
import {ContentType, RemoveContentFromLearningTagPageModel} from './model/removeContentFromLearningTagPageModel'
import {LearningTagHyperlinksResponse} from '../../learning-catalogue/model/learningTag/learningTagHyperlinksResponse'

export type learningTagContentType = 'courses' | 'hyperlinks'

export class LearningTagController extends LearningTagControllerBase {

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
			postRequest('/:learningTagId/courses/remove/:courseId', this.removeSingleContent('courses'), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/courses/remove', this.bulkRemoveContent('courses', RemoveCoursesFromLearningTagPageModel), {
				dtoClass: RemoveCoursesFromLearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getCourses()
				}
			}, [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			getRequest('/:learningTagId/hyperlinks', this.getHyperlinks(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequest('/:learningTagId/hyperlinks/remove/:hyperlinkId', this.removeSingleContent('hyperlinks'), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/hyperlinks/remove', this.bulkRemoveContent('hyperlinks', RemoveHyperlinksFromLearningTagPageModel), {
				dtoClass: RemoveHyperlinksFromLearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getHyperlinks()
				}
			}, [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			getRequest('/:learningTagId/hyperlink', this.getCreateHyperlink(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/hyperlink', this.createHyperlink(), {
				dtoClass: HyperlinkPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getCreateHyperlink()
				}
			},  [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			getRequest('/:learningTagId/hyperlink/:hyperlinkId', this.getEditHyperlink(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/hyperlink/:hyperlinkId', this.editHyperlink(), {
				dtoClass: HyperlinkPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getEditHyperlink()
				}
			},  [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
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

	private getHyperlinks() {
		return async(request: Request, response: Response) => {
			let pageModel = plainToInstance(RemoveHyperlinksFromLearningTagPageModel, response.locals.input as RemoveHyperlinksFromLearningTagPageModel)
			const params = plainToInstance(LearningTagCourseSearchParams, request.query)
			params.learningTagId = response.locals.learningTag.id
			const results: LearningTagHyperlinksResponse = await this.learningTagService.getHyperlinksPage(response.locals.learningTag.id, params)
			const pagePagination = this.pagination.getPagination(params, results)
			if (pageModel === undefined) {
				pageModel = new RemoveHyperlinksFromLearningTagPageModel(results.results, pagePagination)
			} else {
				pageModel.setResults(results.results)
				pageModel.pagePagination = pagePagination
			}
			response.render('page/learning-tags/view-hyperlinks.njk', {pageModel})
		}
	}

	private getCourses() {
		return async(request: Request, response: Response) => {
			let pageModel = plainToInstance(RemoveCoursesFromLearningTagPageModel, response.locals.input as RemoveCoursesFromLearningTagPageModel)
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
			response.render('page/learning-tags/view-courses.njk', {pageModel})
		}
	}

	private removeContent = async (request: Request, response: Response, ids: string[], contentType: learningTagContentType) => {
		const learningTagId = response.locals.learningTag.id as number
		let removeResults
		if (contentType === 'courses') {
			removeResults = await this.learningTagService.removeCourses(learningTagId, ids)
		} else {
			removeResults = await this.learningTagService.removeHyperlinks(learningTagId, ids)
		}
		request.session!.sessionFlash = { removeResults }
		return request.session!.save(() => {
			response.redirect(`/content-management/learning-tags/${learningTagId}/${contentType}`)
		})
	}

	private removeSingleContent(contentType: learningTagContentType) {
		return async(request: Request, response: Response) => {
			return await this.removeContent(request, response, [request.params.id], contentType)
		}
	}

	private bulkRemoveContent <T extends ContentType> (contentType: learningTagContentType, pageModel: ClassConstructor<RemoveContentFromLearningTagPageModel<T>>) {
		return async(request: Request, response: Response) => {
			const model = plainToInstance(pageModel, response.locals.input as RemoveContentFromLearningTagPageModel<T>)
			return await this.removeContent(request, response, model.getIds(), contentType)
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

	private getCreateHyperlink() {
		return async(request: Request, response: Response) => {
			let pageModel = plainToInstance(HyperlinkPageModel, response.locals.input as HyperlinkPageModel) || new HyperlinkPageModel('', '', '')
			response.render('page/learning-tags/create-hyperlink.njk', {pageModel})
		}
	}

	private createHyperlink() {
		return async(request: Request, response: Response) => {
			const learningTagId = response.locals.learningTag.id as number
			const pageModel = plainToInstance(HyperlinkPageModel, response.locals.input as HyperlinkPageModel)
			await this.learningTagService.createHyperlink(learningTagId, pageModel)
			request.session!.sessionFlash = { linkAssignedMessage: {linkTitle: pageModel.title, learningTagName: response.locals.learningTag.name} }
			return request.session!.save(() => {
				return response.redirect('/content-management/learning-tags/manage')
			})
		}
	}

	private getEditHyperlink() {
		return async(request: Request, response: Response) => {
			const hyperlink: Hyperlink = response.locals.hyperlink
			let pageModel = plainToInstance(HyperlinkPageModel, response.locals.input as HyperlinkPageModel)
				|| new HyperlinkPageModel(hyperlink.title, hyperlink.description, hyperlink.href)
			response.render('page/learning-tags/edit-hyperlink.njk', {pageModel})
		}
	}

	private editHyperlink() {
		return async (request: Request, response: Response) => {
			const learningTagId = parseInt(request.params.learningTagId)
			const pageModel = plainToInstance(HyperlinkPageModel, response.locals.input as HyperlinkPageModel)
			await this.learningTagService.editHyperlink(learningTagId, response.locals.hyperlink.id, pageModel)
			request.session!.sessionFlash = { linkUpdatedMessage: {linkTitle: pageModel.title, learningTagName: response.locals.learningTag.name} }
			return request.session!.save(() => {
				return response.redirect(`/content-management/learning-tags/${learningTagId}`)
			})
		}
	}
}
