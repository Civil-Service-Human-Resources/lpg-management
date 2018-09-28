import {Request, Response, Router} from 'express'
import {LearningCatalogue} from '../../learning-catalogue'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import {ContentRequest} from '../../extended'
import {Validator} from '../../learning-catalogue/validator/validator'
import {Module} from '../../learning-catalogue/model/module'
import * as config from '../../config'
import * as fileType from '../../lib/fileType'
import {OauthRestService} from 'lib/http/oauthRestService'

export class FileController {
	learningCatalogue: LearningCatalogue
	moduleValidator: Validator<Module>
	moduleFactory: ModuleFactory
	router: Router
	restService: OauthRestService

	constructor(
		learningCatalogue: LearningCatalogue,
		moduleValidator: Validator<Module>,
		moduleFactory: ModuleFactory,
		restService: OauthRestService
	) {
		this.learningCatalogue = learningCatalogue
		this.moduleFactory = moduleFactory
		this.moduleValidator = moduleValidator
		this.router = Router()
		this.setRouterPaths()

		this.restService = restService
	}

	/* istanbul ignore next */
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
		this.router.get('/content-management/courses/:courseId/module-file', this.getFile())
		this.router.post('/content-management/courses/:courseId/module-file', this.setFile())
		this.router.get('/content-management/courses/:courseId/module-e-learning', this.getScorm())
	}

	public getFile() {
		return async (request: Request, response: Response) => {
			if (request.session!.sessionFlash && request.session!.sessionFlash.mediaId) {
				const mediaId = request.session!.sessionFlash.mediaId

				const media = await this.restService.get(`/${mediaId}`)

				return response.render('page/course/module/module-file', {type: 'file', media})
			}

			return response.render('page/course/module/module-file', {type: 'file'})
		}
	}

	public setFile() {
		return async (request: Request, response: Response) => {
			const req = request as ContentRequest
			let data = {
				...req.body,
			}

			data.type = fileType.getFileModuleType(data.file)

			const course = response.locals.course
			let module = await this.moduleFactory.create(data)
			let errors = await this.moduleValidator.check(data, ['title', 'description', 'mediaId'])

			let file
			if (data.mediaId) {
				file = await this.restService.get(`/${data.mediaId}`)
			}

			if (errors.size) {
				request.session!.sessionFlash = {
					errors: errors,
					module: module,
					media: file,
				}

				return request.session!.save(() => {
					response.redirect(`/content-management/courses/${course.id}/module-${data.fileType}`)
				})
			}

			const newData = {
				id: data.id,
				type: data.type,
				title: data.title,
				description: data.description,
				optional: data.isOptional || false,
				duration: Math.abs(data.days * 86400) + Math.abs(data.hours * 3600) + Math.abs(data.minutes * 60),
				fileSize: file.fileSizeKB,
				mediaId: file.id,
				url: config.CONTENT_URL + '/' + file.path,
				startPage: file.metadata.startPage,
			}
			module = await this.moduleFactory.create(newData)

			await this.learningCatalogue.createModule(course.id, module)
			response.redirect(`/content-management/courses/${course.id}/preview`)
		}
	}

	public getScorm() {
		return async (request: Request, response: Response) => {
			if (request.session!.sessionFlash && request.session!.sessionFlash.mediaId) {
				const mediaId = request.session!.sessionFlash.mediaId

				const media = await this.restService.get(`/${mediaId}`)

				return response.render('page/course/module/module-file', {type: 'e-learning', media})
			}

			return response.render('page/course/module/module-file', {type: 'e-learning'})
		}
	}
}
