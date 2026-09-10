import {LearningTagControllerBase} from '../learningTagControllerBase'
import {LearningTagService} from '../../../learning-catalogue/service/learningTagService'
import {IUserRole, learningTagCourseManagerRole} from '../../../identity/identity'
import {getRequest, postRequest, postRequestWithBody, Route} from '../../route'
import {BehaviourOnError} from '../../../validators/validatorMiddleware'
import {learningTagContentType} from '../learningTagController'
import {compoundRoleCheckMiddleware} from '../../middleware/roleCheckMiddleware'
import {Request, Response} from 'express'
import {ContentType, RemoveContentFromLearningTagPageModel} from '../model/removeContentFromLearningTagPageModel'
import {ClassConstructor, plainToInstance} from 'class-transformer'
import {ContentSearchParams} from '../model/contentSearchParams'
import {DefaultPageResults} from '../../../learning-catalogue/model/defaultPageResults'
import {PaginationService} from '../../../lib/paginationService'
import {SessionableObjectService} from '../../reporting/utils'

export abstract class LearningTagContentManagementControllerBase<T extends ContentType> extends LearningTagControllerBase {

	protected modelSession = new SessionableObjectService("removeModel", this.removePageModelDto)

	constructor(protected learningTagService: LearningTagService, protected learningTagContentType: learningTagContentType,
				protected removePageModelDto: ClassConstructor<RemoveContentFromLearningTagPageModel<T>>,
				protected searchQueryDto: ClassConstructor<ContentSearchParams>,
				private pagination: PaginationService) {
		super('LearningTagController', learningTagService)
	}

	protected getRequiredRole(): IUserRole | undefined {
		return learningTagCourseManagerRole
	}

	protected getRoutes(): Route[] {
		return [
			getRequest(`/:learningTagId/${this.learningTagContentType}`, this.getContent(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequest(`/:learningTagId/${this.learningTagContentType}/remove/:id/confirm`, this.removeSingleContent()),
			postRequest(`/:learningTagId/${this.learningTagContentType}/remove/confirm`, this.bulkRemoveContent()),
			postRequest(`/:learningTagId/${this.learningTagContentType}/remove/:id`, this.removeSingleContentConfirm(), [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
			postRequestWithBody(`/:learningTagId/${this.learningTagContentType}/remove`, this.bulkRemoveContentConfirm(), {
				dtoClass: this.removePageModelDto,
				onError: {
					behaviour: BehaviourOnError.ROUTER_FUNCTION,
					routerFunction: this.getContent()
				}
			}, [compoundRoleCheckMiddleware(learningTagCourseManagerRole)]),
		]
	}

	abstract remove: (learningTagId: number, ids: string[]) => Promise<string>
	abstract getResults: (learningTagId: number, params: ContentSearchParams) => Promise<DefaultPageResults<T>>

	private getContent() {
		return async(request: Request, response: Response) => {
			this.modelSession.deleteObjectFromSession(request)
			let pageModel = plainToInstance(this.removePageModelDto, response.locals.input)
			const params = plainToInstance(this.searchQueryDto, request.query)
			params.learningTagId = response.locals.learningTag.id
			const results = await this.getResults(response.locals.learningTag.id, params)
			const pagePagination = this.pagination.getPagination(params, results)
			if (pageModel === undefined) {
				pageModel = new RemoveContentFromLearningTagPageModel(results.results, pagePagination)
			} else {
				pageModel.setResults(results.results)
				pageModel.pagePagination = pagePagination
			}
			response.render(`page/learning-tags/view-${this.learningTagContentType}.njk`, {pageModel})
		}
	}

	private removeContent = async (request: Request, response: Response, ids: string[]) => {
		const learningTagId = response.locals.learningTag.id as number
		let removeResultsBanner = await this.remove(learningTagId, ids)
		request.session!.sessionFlash = { removeResultsBanner }
		return request.session!.save(() => {
			response.redirect(`/content-management/learning-tags/${learningTagId}/${this.learningTagContentType}`)
		})
	}

	private removeSingleContent() {
		return async(request: Request, response: Response) => {
			return await this.removeContent(request, response, [request.params.id])
		}
	}

	private bulkRemoveContent() {
		return async(request: Request, response: Response) => {
			const model = this.modelSession.fetchObjectFromSession(request)
			if (model === undefined || model.getIds().length === 0) {
				return response.redirect(`/content-management/learning-tags/${response.locals.learningTag.id}/${this.learningTagContentType}`)
			}
			return await this.removeContent(request, response, model.getIds())
		}
	}

	private removeSingleContentConfirm() {
		return async (request: Request, response: Response) => {
			response.locals.id = request.params.id
			return response.render(`page/learning-tags/remove-${this.learningTagContentType}-confirm.njk`, {items: [request.body[`title[${request.params.id}]`]]})
		}
	}

	private bulkRemoveContentConfirm() {
		return async (request: Request, response: Response) => {
			const model = plainToInstance(this.removePageModelDto, response.locals.input)
			this.modelSession.saveObjectToSession(request, model)
			return response.render(`page/learning-tags/remove-${this.learningTagContentType}-confirm.njk`, {items: model.getIds()})
		}
	}
}
