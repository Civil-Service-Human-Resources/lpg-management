import {LearningCatalogue} from '../../learning-catalogue'
import {Validator} from '../../learning-catalogue/validator/validator'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import {NextFunction, Request, Response, Router} from 'express'
import {Module} from '../../learning-catalogue/model/module'
import * as asyncHandler from 'express-async-handler'
import {CourseService} from 'lib/courseService'
import {applyLearningCatalogueMiddleware} from '../middleware/learningCatalogueMiddleware'
const { xss } = require('express-xss-sanitizer')


export class FaceToFaceModuleController {
	learningCatalogue: LearningCatalogue
	moduleValidator: Validator<Module>
	moduleFactory: ModuleFactory
	courseService: CourseService
	router: Router

	constructor(learningCatalogue: LearningCatalogue, moduleValidator: Validator<Module>, moduleFactory: ModuleFactory, courseService: CourseService) {
		this.learningCatalogue = learningCatalogue
		this.moduleValidator = moduleValidator
		this.moduleFactory = moduleFactory
		this.courseService = courseService
		this.router = Router()

		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		applyLearningCatalogueMiddleware({getModule: true}, this.router, this.learningCatalogue)
		this.router.get('/content-management/courses/:courseId/module-face-to-face/:moduleId?', xss(), asyncHandler(this.getModule()))
		this.router.post('/content-management/courses/:courseId/module-face-to-face/', xss(), asyncHandler(this.setModule()))
		this.router.post('/content-management/courses/:courseId/module-face-to-face/:moduleId', xss(), asyncHandler(this.editModule()))
	}

	public getModule() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-face-to-face')
		}
	}

	public setModule() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const data = {...request.body}
			if (!data.cost) {
				delete data.cost
			}

			const course = response.locals.course
			const errors = await this.moduleValidator.check(data, ['title', 'description', 'cost'])
			const module = await this.moduleFactory.create(data)

			if (errors.size) {
				request.session!.sessionFlash = {errors: errors, module: module}
				request.session!.save(() => {
					response.redirect(`/content-management/courses/${course.id}/module-face-to-face`)
				})
			} else {
				await this.learningCatalogue
					.createModule(course.id, module)
					.then(() => {
						response.redirect(`/content-management/courses/${course.id}/preview`)
					})
					.catch(error => {
						next(error)
					})
			}
		}
	}

	public editModule() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const data = {...request.body}
			if (!data.cost) {
				delete data.cost
			}

			const course = response.locals.course
			const module = response.locals.module
			const errors = await this.moduleValidator.check(data, ['title', 'description', 'cost'])

			if (errors.size) {
				request.session!.sessionFlash = {errors: errors, module: module}
				request.session!.save(() => {
					response.redirect(`/content-management/courses/${course.id}/module-face-to-face/${request.params.moduleId}`)
				})
			} else {
				module.title = data.title
				module.description = data.description
				module.cost = data.cost
				module.optional = data.optional || false

				await this.learningCatalogue
					.updateModule(course.id, module)
					.then(() => {
						response.redirect(`/content-management/courses/${course.id}/preview`)
					})
					.catch(error => {
						next(error)
					})
			}
		}
	}
}
