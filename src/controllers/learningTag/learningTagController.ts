import {NextFunction, Request, Response} from 'express'
import {getRequest, Route} from '../route'
import {Controller} from '../controller'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {IUserRole, learningTagManagerRole} from '../../identity/identity'

export class LearningTagController extends Controller {
	constructor(private learningTagService: LearningTagService) {
		super('/content-management/learning-tags', 'LearningTagController')
	}

	protected getRequiredRole(): IUserRole | undefined {
		return learningTagManagerRole
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/manage', this.getLearningTagList())
		]
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

}
