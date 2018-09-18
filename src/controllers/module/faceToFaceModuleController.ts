import {LearningCatalogue} from '../../learning-catalogue'
import {Validator} from '../../learning-catalogue/validator/validator'
import {ModuleFactory} from '../../learning-catalogue/model/factory/moduleFactory'
import {Request, Response, Router} from 'express'
import {Module} from '../../learning-catalogue/model/module'

export class FaceToFaceModuleController {
	learningCatalogue: LearningCatalogue
	moduleValidator: Validator<Module>
	moduleFactory: ModuleFactory
	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		moduleValidator: Validator<Module>,
		moduleFactory: ModuleFactory
	) {
		this.learningCatalogue = learningCatalogue
		this.moduleValidator = moduleValidator
		this.moduleFactory = moduleFactory
		this.router = Router()

		this.setRouterPaths()
	}

	private setRouterPaths() {
		this.router.param('courseId', async (req, res, next, courseId) => {
			const course = await this.learningCatalogue.getCourse(courseId, this.getAccessToken(req))

			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.get('/content-management/courses/:courseId/module-face-to-face/:moduleId?', this.getModule())
		this.router.post('/content-management/courses/:courseId/module-face-to-face/:moduleId?', this.setModule())
	}

	public getModule() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/module-face-to-face')
		}
	}

	public setModule() {
		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const course = response.locals.course

			const errors = await this.moduleValidator.check(data, ['title', 'description'])

			const module = await this.moduleFactory.create(data)

			if (errors.size) {
				request.session!.sessionFlash = {errors: errors, module: module}
				return response.redirect(`/content-management/courses/${course.id}/module-face-to-face`)
			}

			await this.learningCatalogue.createModule(course.id, module, this.getAccessToken(request))

			return response.redirect(`/content-management/courses/${course.id}/preview`)
		}
	}

	private getAccessToken(request: Request) {
		return JSON.parse(request.session!.passport.user).accessToken
	}
}
