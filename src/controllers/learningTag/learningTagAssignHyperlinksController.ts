import {Request, Response} from 'express'
import {LearningTagControllerBase} from './learningTagControllerBase'
import {createRouteCollection, getRequest, postRequestWithBody, RouteCollection} from '../route'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {plainToInstance} from 'class-transformer'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {SearchForTagModel} from './model/searchForTagModel'
import {learningTagAuthorRole} from '../../identity/identity'

export class LearningTagAssignHyperlinksController extends LearningTagControllerBase {

	constructor(protected learningTagService: LearningTagService) {
		super('LearningTagAssignHyperlinksController', learningTagService)
	}

	protected getRouteCollections(): RouteCollection[] {
		return [
			createRouteCollection([
				getRequest('/assign-hyperlinks/select-learning-tag', this.getSearchForTag()),
				postRequestWithBody('/assign-hyperlinks/select-learning-tag', this.searchForTag(), {
					dtoClass: SearchForTagModel,
					onError: {
						behaviour: BehaviourOnError.ROUTER_FUNCTION,
						routerFunction: this.getSearchForTag()
					}
				}),
			], [], learningTagAuthorRole)
		]
	}

	private getSearchForTag() {
		return async(request: Request, response: Response) => {
			const tagsList = await this.learningTagService.getTypeahead()
			let pageModel = plainToInstance(SearchForTagModel, response.locals.input as SearchForTagModel) || new SearchForTagModel([])
			pageModel.tagsList = tagsList
			response.render('page/learning-tags/assign/hyperlinks/search-for-tag.njk', {pageModel})
		}
	}

	private searchForTag() {
		return async(request: Request, response: Response) => {
			const pageModel = plainToInstance(SearchForTagModel, response.locals.input as SearchForTagModel)
			return response.redirect(`/content-management/learning-tags/${pageModel.tagSelect}/hyperlinks/create`)
		}
	}

}