import {Request, Response, Router} from 'express'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {RequestUtil} from '../../lib/requestUtil'

const logger = log4js.getLogger('controllers/moduleController')

export class ModuleController {
	learningCatalogue: LearningCatalogue
	moduleFactory: ModuleFactory
	router: Router

	constructor(learningCatalogue: LearningCatalogue, moduleFactory: ModuleFactory) {
		this.learningCatalogue = learningCatalogue
		this.moduleFactory = moduleFactory
		this.router = Router()
		this.setRouterPaths()
	}

	private setRouterPaths() {
		this.router.param('courseId', async (req, res, next, courseId) => {
			const course = await this.learningCatalogue.getCourse(courseId, RequestUtil.getAccessToken(req))
			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})
		this.router.get('/content-management/courses/:courseId/add-module', this.addModule())
		this.router.post('/content-management/courses/:courseId/add-module', this.setModule())
	}

	public addModule() {
		logger.debug('Add module page')

		return async (request: Request, response: Response) => {
			response.render('page/course/module/add-module')
		}
	}

	public setModule() {
		return async (request: Request, response: Response) => {
			const moduleType = request.body.module
			const courseId = response.locals.course.id

			if (moduleType === '') {
				return response.redirect(`/content-management/courses/${courseId}/add-module`)
			}

			return response.redirect(`/content-management/courses/${courseId}/module-${moduleType}`)
		}
	}

	public addFile() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-file')
		}
	}
}
