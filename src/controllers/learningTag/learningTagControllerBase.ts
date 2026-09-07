import {Controller} from '../controller'
import {SessionableObjectService} from '../reporting/utils'
import {AssignCoursesToTagsModel} from './model/assignCoursesToTagsModel'
import {IUserRole, learningTagManagerRole} from '../../identity/identity'
import {LearningTagService} from '../../learning-catalogue/service/learningTagService'
import {NextFunction, Request, Response} from 'express'
import * as asyncHandler from 'express-async-handler'
import {LearningTag} from '../../learning-catalogue/model/learningTag/learningTag'

export abstract class LearningTagControllerBase extends Controller {
	protected assignCoursesToTagsModelSession = new SessionableObjectService("assignCoursesToTagsModel", AssignCoursesToTagsModel)
	protected constructor (
		protected controllerName: string,
		protected learningTagService: LearningTagService) {
		super("/content-management/learning-tags", controllerName)
		this.getLearningTagFromRouterParamAndSetOnLocals()
	}

	protected getRequiredRole(): IUserRole | undefined {
		return learningTagManagerRole
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
}