import {NextFunction, Request, Response} from 'express'
import {getRequest, Route} from '../route'
import {Controller} from '../controller'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {IUserRole, learningTagManagerRole} from '../../identity/identity'
import * as asyncHandler from 'express-async-handler'
import {LearningTag} from '../../learning-catalogue/model/learningTag/learningTag'

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
			getRequest('/manage', this.getLearningTagList()),
			getRequest('/:learningTagId/overview', this.getTagOverview()),
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

	public getLearningTagList() {
		return async (request: Request, response: Response, next: NextFunction) => {
			await this.learningTagService
				.getTree()
				.then(learningTags => {
					response.render('page/learning-tags/manage-learning-tags', {learningTags})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	private getTagOverview() {
		return function(request: Request, response: Response, next: NextFunction) {
			response.render('page/learning-tags/learning-tag-overview')
		}
	}
}
