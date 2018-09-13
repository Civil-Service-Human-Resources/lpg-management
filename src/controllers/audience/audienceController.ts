import {Request, Response, Router} from 'express'
import {AudienceFactory} from '../../learning-catalogue/model/factory/audienceFactory'
import {LearningCatalogue} from '../../learning-catalogue'

export class AudienceController {
	learningCatalogue: LearningCatalogue
	audienceFactory: AudienceFactory
	router: Router

	constructor(learningCatalogue: LearningCatalogue, audienceFactory: AudienceFactory) {
		this.learningCatalogue = learningCatalogue
		this.audienceFactory = audienceFactory
		this.router = Router()
		this.setPathParametersMapping()
		this.setRouterPaths()
	}

	private setPathParametersMapping() {
		this.router.param('courseId', async (req, res, next, courseId) => {
			const course = await this.learningCatalogue.getCourse(courseId)
			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})
	}

	private setRouterPaths() {
		this.router.get('/content-management/courses/:courseId/audience', this.getAudienceName())
		this.router.post('/content-management/courses/:courseId/audience', this.setAudienceName())
		this.router.get('/content-management/courses/:courseId/audience-type', this.addAudienceType())
		this.router.post('/content-management/courses/:courseId/audience-type', this.setAudienceType())
	}

	public getAudienceName() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/audience-name')
		}
	}

	public setAudienceName() {
		return async (req: Request, res: Response) => {
			if (name === '') {
				return res.redirect(`/content-management/courses/${req.params.courseId}/audience`)
			}
			//To be completed
			return res.redirect(`/content-management/courses/${req.params.courseId}/audience/`)
		}
	}

	public addAudienceType() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/audience-type')
		}
	}

	public setAudienceType() {
		return async (request: Request, response: Response) => {
			const courseId = response.locals.course.id

			return response.redirect(`/content-management/courses/${courseId}/audience-type/`)
		}
	}
}