import {NextFunction, Request, Response, Router} from 'express'
import {LearningCatalogue} from '../../learning-catalogue'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import {Module} from '../../learning-catalogue/model/module'
import {Validator} from '../../learning-catalogue/validator/validator'
import {YoutubeService} from '../../youtube/youtubeService'
import * as asyncHandler from 'express-async-handler'
import {CourseService} from 'lib/courseService'
import moment = require('moment')
const { xss } = require('express-xss-sanitizer')

export class YoutubeModuleController {
	learningCatalogue: LearningCatalogue
	moduleValidator: Validator<Module>
	moduleFactory: ModuleFactory
	youtube: YoutubeService
	courseService: CourseService

	router: Router

	constructor(learningCatalogue: LearningCatalogue, moduleValidator: Validator<Module>, moduleFactory: ModuleFactory, youtube: YoutubeService, courseService: CourseService) {
		this.learningCatalogue = learningCatalogue
		this.moduleValidator = moduleValidator
		this.moduleFactory = moduleFactory
		this.youtube = youtube
		this.courseService = courseService

		this.router = Router()
		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		let course: any
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

		this.router.get('/content-management/courses/:courseId/module-youtube/:moduleId?', asyncHandler(this.getModule()))
		this.router.post('/content-management/courses/:courseId/module-youtube/', xss(), asyncHandler(this.setModule()))
		this.router.post('/content-management/courses/:courseId/module-youtube/:moduleId', asyncHandler(this.updateModule()))
	}

	public getModule() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-youtube')
		}
	}

	public setModule() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const data = {...req.body}

			const course = res.locals.course
			let module = await this.moduleFactory.create(data)

			let errors = await this.moduleValidator.check(data, ['title', 'url'])

			const duration = await this.getDuration(data)
			if (typeof duration !== 'number') {
				errors.fields.youtubeResponse = [duration]
				errors.size += 1
			}

			if (errors.size) {
				req.session!.sessionFlash = {errors: errors, module: module}
				return req.session!.save(() => {
					res.redirect(`/content-management/courses/${course.id}/module-youtube/`)
				})
			}

			const newData = {
				type: data.type || 'video',
				title: data.title,
				description: data.description || 'No description',
				duration: duration,
				optional: data.isOptional || false,
				url: data.url,
				associatedLearning: data.associatedLearning,
			}
			module = await this.moduleFactory.create(newData)

			await this.learningCatalogue
				.createModule(course.id, module)
				.then(() => {
					return res.redirect(`/content-management/courses/${course.id}/preview`)
				})
				.catch(error => {
					next(error)
				})
		}
	}

	public updateModule() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const data = {...req.body}

			const course = res.locals.course
			const module = res.locals.module

			let errors = await this.moduleValidator.check(data, ['title', 'url'])

			const duration = await this.getDuration(data)
			if (typeof duration !== 'number') {
				errors.fields.youtubeResponse = [duration]
				errors.size += 1
			}

			if (errors.size) {
				req.session!.sessionFlash = {errors: errors, module: module}
				return req.session!.save(() => {
					res.redirect(`/content-management/courses/${course.id}/module-youtube/${req.params.moduleId}`)
				})
			}

			module.title = data.title
			module.description = data.description
			module.optional = data.isOptional || false
			module.url = data.url
			module.duration = duration
			module.associatedLearning = req.body.associatedLearning

			await this.learningCatalogue
				.updateModule(course.id, module)
				.then(() => {
					return res.redirect(`/content-management/courses/${course.id}/preview`)
				})
				.catch(error => {
					next(error)
				})
		}
	}

	private async getDuration(data: any) {
		let duration

		const youtubeResponse = await this.youtube.getYoutubeResponse(data.url)
		if (!youtubeResponse || !this.youtube.checkYoutubeResponse(youtubeResponse)) {
			return 'validation_module_video_notFound'
		} else {
			const info = this.youtube.getBasicYoutubeInfo(youtubeResponse)
			duration = await this.youtube.getDuration(info.id)

			if (!duration) {
				return 'validation_module_video_noDuration'
			}
		}

		return duration
	}
}
