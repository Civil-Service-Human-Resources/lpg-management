import {Request, Response, Router} from 'express'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {LinkFactory} from '../../learning-catalogue/model/factory/linkFactory'
import {Validator} from '../../learning-catalogue/validator/validator'
import {Module} from '../../learning-catalogue/model/module'
import moment = require('moment')

const logger = log4js.getLogger('controllers/linkModuleController')

export class LinkModuleController {
	learningCatalogue: LearningCatalogue
	linkFactory: LinkFactory
	moduleValidator: Validator<Module>

	router: Router

	constructor(learningCatalogue: LearningCatalogue, linkFactory: LinkFactory, moduleValidator: Validator<Module>) {
		this.learningCatalogue = learningCatalogue
		this.linkFactory = linkFactory
		this.moduleValidator = moduleValidator

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
		this.router.get('/content-management/courses/:courseId/module-link', this.addLinkModule())
		this.router.post('/content-management/courses/:courseId/module-link', this.setLinkModule())
	}

	public addLinkModule() {
		logger.debug('Add module page')

		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-link')
		}
	}

	public setLinkModule() {
		return async (request: Request, response: Response) => {
			const course = response.locals.course
			const data = {
				...request.body,
				duration: moment.duration({
					hours: request.body.hours,
					minutes: request.body.minutes
				}).asSeconds(),
				type: 'link',
			}

			const errors = await this.moduleValidator.check(data, ['title', 'description', 'url', 'duration'])

			if (errors.size) {
				return response.render('page/course/module/module-link', {
					module: data,
					errors: errors
				})
			}

			const linkModule = this.linkFactory.create(data)
			await this.learningCatalogue.createModule(course.id, linkModule)

			return response.redirect(`/content-management/courses/${course.id}/add-module`)
		}
	}
}
