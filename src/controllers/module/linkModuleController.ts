import {Request, Response, Router} from 'express'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {LinkFactory} from '../../learning-catalogue/model/factory/linkFactory'

const logger = log4js.getLogger('controllers/linkModuleController')

export class LinkModuleController {
	learningCatalogue: LearningCatalogue
	linkFactory: LinkFactory
	router: Router

	constructor(learningCatalogue: LearningCatalogue, linkFactory: LinkFactory) {
		this.learningCatalogue = learningCatalogue
		this.linkFactory = linkFactory

		this.router = Router()

		this.setRouterPaths()
	}

	private setRouterPaths() {
		this.router.param('courseId', async (req, res, next, courseId) => {
			const course = await this.learningCatalogue.getCourse(courseId)
			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})
		this.router.get('/content-management/courses/:courseId/module-link', this.addModuleLink())
		this.router.post('/content-management/courses/:courseId/module-link', this.setModuleLink())
	}

	public addModuleLink() {
		logger.debug('Add module page')

		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-link')
		}
	}

	public setModuleLink() {
		return async (request: Request, response: Response) => {
			const course = response.locals.course
			const data = {
				...request.body,
				type: 'link',
			}

			const linkModule = this.linkFactory.create(data)
			await this.learningCatalogue.createModule(course.id, linkModule)

			return response.redirect(`/content-management/courses/${course.id}/add-module`)
		}
	}
}
