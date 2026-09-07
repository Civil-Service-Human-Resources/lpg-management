import {NextFunction, Request, Response} from 'express'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {learningTagArchiveRole, learningTagCourseManagerRole} from '../../identity/identity'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {LearningTagPageModel} from './model/learningTagPageModel'
import {compoundRoleCheckMiddleware} from '../middleware/roleCheckMiddleware'
import {plainToInstance} from 'class-transformer'
import {LearningTagControllerBase} from './learningTagControllerBase'
import {HyperlinkPageModel} from './model/hyperlinkPageModel'

export type learningTagContentType = 'courses' | 'hyperlinks'

export class LearningTagController extends LearningTagControllerBase {

	constructor(protected learningTagService: LearningTagService) {
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
			getRequest('/:learningTagId/hyperlinks/create', this.getCreateHyperlink(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/hyperlinks', this.createHyperlink(), {
				dtoClass: HyperlinkPageModel,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getCreateHyperlink()
				}
			},  [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			getRequest('/:learningTagId/hyperlinks/:hyperlinkId', this.getEditHyperlink(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody('/:learningTagId/hyperlinks/:hyperlinkId', this.editHyperlink(), {
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
			response.render('page/learning-tags/hyperlinks/create.njk', {pageModel})
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
			const hyperlink: HyperlinkPageModel = response.locals.hyperlink
			let pageModel = plainToInstance(HyperlinkPageModel, response.locals.input as HyperlinkPageModel)
				|| new HyperlinkPageModel(hyperlink.title, hyperlink.description, hyperlink.url)
			response.render('page/learning-tags/hyperlinks/edit.njk', {pageModel})
		}
	}

	private editHyperlink() {
		return async (request: Request, response: Response) => {
			const learningTagId = parseInt(request.params.learningTagId)
			const pageModel = plainToInstance(HyperlinkPageModel, response.locals.input as HyperlinkPageModel)
			await this.learningTagService.editHyperlink(learningTagId, response.locals.hyperlink.id, pageModel)
			request.session!.sessionFlash = { linkUpdatedMessage: {linkTitle: pageModel.title }}
			return request.session!.save(() => {
				return response.redirect(`/content-management/learning-tags/${learningTagId}/hyperlinks`)
			})
		}
	}
}
