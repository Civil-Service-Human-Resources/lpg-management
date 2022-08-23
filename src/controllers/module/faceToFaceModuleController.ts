import {LearningCatalogue} from '../../learning-catalogue'
import {Validator} from '../../learning-catalogue/validator/validator'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import {NextFunction, Request, Response, Router} from 'express'
import {Module} from '../../learning-catalogue/model/module'
import * as asyncHandler from 'express-async-handler'
import * as moment from 'moment'
import {Course} from '../../learning-catalogue/model/course'
import {CourseService} from 'lib/courseService'
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
		let course: Course
		this.router.param(
			'courseId',
			asyncHandler(async (req: Request, res: Response, next: NextFunction, courseId: string) => {
				course = await this.learningCatalogue.getCourse(courseId)

				if (course) {
					res.locals.course = course
					next()
				} else {
					res.sendStatus(404)
				}
			})
		)

		this.router.param(
			'moduleId',
			asyncHandler(async (req: Request, res: Response, next: NextFunction, moduleId: string) => {
				if (course) {
					const module = await this.courseService.getModuleByModuleId(course, moduleId)
					if (module) {
						const duration = moment.duration(module.duration, 'seconds')
						res.locals.module = module
						res.locals.module.hours = duration.hours()
						res.locals.module.minutes = duration.minutes()
						next()
					} else {
						res.sendStatus(404)
					}
				}
			})
		)

		this.router.get('/content-management/courses/:courseId/module-face-to-face/:moduleId?', asyncHandler(this.getModule()))
		this.router.post('/content-management/courses/:courseId/module-face-to-face/', xss(), asyncHandler(this.setModule()))
		this.router.post('/content-management/courses/:courseId/module-face-to-face/:moduleId', asyncHandler(this.editModule()))
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
				module.optional = data.isOptional || false

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
