import {Request, Response, Router} from 'express'
import {LearningCatalogue} from '../../learning-catalogue'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import {ContentRequest} from '../../extended'
import {YoutubeService} from '../../lib/youtubeService'
import {Module} from '../../learning-catalogue/model/module'
import {Validator} from '../../learning-catalogue/validator/validator'

export class YoutubeModuleController {
	learningCatalogue: LearningCatalogue
	moduleValidator: Validator<Module>
	moduleFactory: ModuleFactory
	router: Router
	youtube: YoutubeService

	constructor(
		learningCatalogue: LearningCatalogue,
		moduleValidator: Validator<Module>,
		moduleFactory: ModuleFactory,
		youtube: YoutubeService
	) {
		this.learningCatalogue = learningCatalogue
		this.moduleValidator = moduleValidator
		this.moduleFactory = moduleFactory
		this.router = Router()
		this.youtube = youtube

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

		this.router.get('/content-management/courses/:courseId/youtube-module', this.getModule())
		this.router.post('/content-management/courses/:courseId/youtube-module', this.setModule())
	}

	public getModule() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-youtube')
		}
	}

	public setModule() {
		return async (request: Request, response: Response) => {
			const req = request as ContentRequest

			let data = {
				...req.body,
			}

			const course = response.locals.course

			let module = await this.moduleFactory.create(data)

			let errors = await this.moduleValidator.check(data, ['title', 'url'])

			let duration

			const youtubeResponse = await this.youtube.getYoutubeResponse(data.url)

			if (!youtubeResponse || !this.youtube.checkYoutubeResponse(youtubeResponse)) {
				errors.fields.youtubeResponse = 'validation_module_video_notFound'
			} else {
				const info = this.youtube.getBasicYoutubeInfo(youtubeResponse)

				duration = await this.youtube.getDuration(info.id)

				if (!duration) {
					errors.fields.youtubeDuration = 'validation_module_video_noDuration'
				}
			}

			if (Object.keys(errors.fields).length != 0) {
				request.session!.sessionFlash = {errors: errors, module: module}
				return response.redirect(`/content-management/courses/${course.id}/youtube-module`)
			}

			const newData = {
				type: data.type || 'video',
				title: data.title,
				description: data.description || 'No description',
				duration: duration,
				optional: data.isOptional || false,
				url: data.url,
			}

			module = await this.moduleFactory.create(newData)

			await this.learningCatalogue.createModule(course.id, module)

			response.redirect(`/content-management/courses/${course.id}/preview`)
		}
	}
}
