import {NextFunction, Request, Response} from 'express'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {Controller} from '../controller'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {IUserRole, learningTagManagerRole} from '../../identity/identity'
import * as asyncHandler from 'express-async-handler'
import {LearningTag} from '../../learning-catalogue/model/learningTag/learningTag'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {LearningTagPageModel} from './model/learningTagPageModel'
import {plainToInstance} from 'class-transformer'

export class LearningTagController extends Controller {

	constructor(private learningTagService: LearningTagService) {
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
					behaviour: BehaviourOnError.REDIRECT,
					path: '/content-management/learning-tags'
				}
			}),
			getRequest('/:learningTagId', this.getEdit()),
			postRequestWithBody('/:learningTagId', this.edit(), {
				dtoClass: LearningTagPageModel,
				onError: {
					behaviour: BehaviourOnError.REDIRECT,
					path: '/content-management/learning-tags/:learningTagId'
				}
			}),
			getRequest('/:learningTagId/unlink-parent-confirm', this.getUnlinkParent()),
			postRequest('/:learningTagId/unlink-parent', this.unlinkParent())
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
		let pageModel = request.session!.pageModel as LearningTagPageModel
		if (pageModel === undefined) {
			pageModel = await this.learningTagService.getPageModel(response.locals.learningTag, true)
		} else {
			pageModel.parentTags = await this.learningTagService.getTypeahead()
			request.session!.pageModel = undefined
		}
		return pageModel
	}

	public getList() {
		return async (request: Request, response: Response, next: NextFunction) => {
			await this.learningTagService
				.getTree()
				.then(learningTags => {
					response.render('page/learning-tags/manage-learning-tags.njk', {learningTags})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	private get() {
		return function(request: Request, response: Response, next: NextFunction) {
			console.log(response.locals.learningTag)
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
			const pageModel = plainToInstance(LearningTagPageModel, response.locals.input as LearningTagPageModel)
			const newLearningTag = await this.learningTagService.create(pageModel)
			request.session!.sessionFlash = {learningTagAddedSuccessMessage: 'learningTagAddedSuccessMessage'}
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
			let learningTag = response.locals.learningTag
			const pageModel = response.locals.input
			this.logger.debug(`Updating learning tag: ${learningTag.id}`)

			if (pageModel.parentId != undefined && pageModel.parentId === learningTag.id) {
				request.session!.sessionFlash = {errors: {fields: {parentId: ['learningTags.validation.organisation.selfReference'], size: 1}}}

				return request.session!.save(() => {
					response.redirect(`/content-management/learning-tags/${learningTag.id}`)
				})
			}

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
}
