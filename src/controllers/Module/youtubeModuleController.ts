import {Request, Response, Router} from 'express'
import {LearningCatalogue} from '../../learning-catalogue'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import * as youtube from '../../lib/youtube'
import {ContentRequest} from '../../extended'
import {ModuleValidator} from '../../learning-catalogue/validator/moduleValidator'

export class YoutubeModuleController {
	learningCatalogue: LearningCatalogue
	moduleValidator: ModuleValidator
	moduleFactory: ModuleFactory
	router: Router

	constructor(learningCatalogue: LearningCatalogue, moduleValidator: ModuleValidator, moduleFactory: ModuleFactory) {
		this.learningCatalogue = learningCatalogue
		this.moduleValidator = moduleValidator
		this.moduleFactory = moduleFactory
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

		this.router.get('/content-management/courses/:courseId/add-youtube-module', this.getModule())
		this.router.post('/content-management/courses/:courseId/add-youtube-module', this.setModule())
	}

	public getModule() {
		return async (request: Request, response: Response) => {
			response.render('page/add-module-youtube')
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

			let errors = await this.moduleValidator.check(data, ['title', 'location'])

			let duration

			const youtubeResponse = await youtube.getYoutubeResponse(data.location)

			if (!youtubeResponse) {
				errors.fields.youtubeResponse = 'validation.module.video.notFound'
			} else {
				const youtubeResponseValid = youtube.checkYoutubeResponse(youtubeResponse)

				if (!youtubeResponseValid) {
					errors.fields.youtubeResponse = 'validation.module.video.notFound'
				} else {
					const info = youtube.getBasicYoutubeInfo(youtubeResponse)

					duration = await youtube.getDuration(info.id)

					if (!duration) {
						errors.fields.youtubeDuration = 'validation.module.video.noDuration'
					}
				}
			}

			if (Object.keys(errors.fields).length != 0) {
				request.session!.sessionFlash = {errors: errors, module: module}
				return response.redirect(`/content-management/courses/${course.id}/add-youtube-module`)
			}

			const newData = {
				id: data.id || 'testid',
				type: data.type || 'video',
				title: data.title || 'test title',
				description: data.description || 'test description',
				duration: duration || 0,
				optional: data.isOptional || false,
			}

			module = await this.moduleFactory.create(newData)

			await this.learningCatalogue.createModule(course.id, module)

			response.redirect(`/content-management/courses/${course.id}/preview`)
		}
	}
}
