import {Request, Response, Router} from 'express'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {LinkFactory} from '../../learning-catalogue/model/factory/linkFactory'
import {Validator} from '../../learning-catalogue/validator/validator'
import moment = require('moment')
import {FormController} from '../formController'
import {CourseService} from 'lib/courseService'
import {LinkModule} from '../../learning-catalogue/model/linkModule'
import {Validate} from '../formValidator'
import {Module} from '../../learning-catalogue/model/module'

const logger = log4js.getLogger('controllers/linkModuleController')

export class LinkModuleController implements FormController {
	learningCatalogue: LearningCatalogue
	linkFactory: LinkFactory
	validator: Validator<LinkModule>
	courseService: CourseService

	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		linkFactory: LinkFactory,
		moduleValidator: Validator<LinkModule>,
		courseService: CourseService
	) {
		this.learningCatalogue = learningCatalogue
		this.linkFactory = linkFactory
		this.validator = moduleValidator
		this.courseService = courseService
		this.router = Router()

		this.setRouterPaths()
	}

	private setRouterPaths() {
		let course: any
		this.router.param('courseId', async (req, res, next, courseId) => {
			course = await this.learningCatalogue.getCourse(courseId)
			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})
		this.router.param('moduleId', async (req, res, next, moduleId) => {
			if (course) {
				const module = this.courseService.getModuleByModuleId(course, moduleId)
				if (module) {
					res.locals.module = module
					next()
				} else {
					res.sendStatus(404)
				}
			} else {
				res.sendStatus(404)
			}
		})
		this.router.get('/content-management/courses/:courseId/module-link/:moduleId?', this.addLinkModule())
		this.router.post('/content-management/courses/:courseId/module-link', this.setLinkModule())
		this.router.post('/content-management/courses/:courseId/module-link/:moduleId?', this.updateLinkModule())
	}

	public addLinkModule() {
		logger.debug('Add module page')

		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-link')
		}
	}

	@Validate({
		fields: ['all'],
		redirect: '/content-management/courses/:courseId/module-link',
	})
	public setLinkModule() {
		return async (request: Request, response: Response) => {
			const course = response.locals.course
			const data = {
				...request.body,
				duration: moment
					.duration({
						hours: request.body.hours,
						minutes: request.body.minutes,
					})
					.asSeconds(),
				type: Module.Type.LINK,
			}

			const linkModule = this.linkFactory.create(data)

			await this.learningCatalogue.createModule(course.id, linkModule)

			return response.redirect(`/content-management/courses/${course.id}/add-module`)
		}
	}

	@Validate({
		fields: ['all'],
		redirect: '/content-management/courses/:courseId/module-link/:moduleId',
	})
	public updateLinkModule() {
		return async (req: Request, res: Response) => {
			const course = res.locals.course

			let module: LinkModule = res.locals.module
			module.title = req.body.title
			module.description = req.body.description
			module.url = req.body.url
			module.optional = req.body.optional

			await this.learningCatalogue.updateModule(course.id, module)

			res.redirect(`/content-management/courses/${req.params.courseId}/add-module`)
		}
	}
}
