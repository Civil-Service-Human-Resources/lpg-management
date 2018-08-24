import {Request, Response, Router} from 'express'
import {ContentRequest} from '../extended'
import {CourseFactory} from '../learning-catalogue/model/factory/courseFactory'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {Validator} from '../learning-catalogue/validator/validator'
import {Module} from "../learning-catalogue/model/module";

const logger = log4js.getLogger('controllers/courseController')

export class CourseController {
	learningCatalogue: LearningCatalogue
	courseValidator: Validator<Course>
	courseFactory: CourseFactory
	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		courseValidator: Validator<Course>,
		courseFactory: CourseFactory
	) {
		this.learningCatalogue = learningCatalogue
		this.courseValidator = courseValidator
		this.courseFactory = courseFactory
		this.router = Router()

		this.getCourseFromRouterParamAndSetOnLocals()

		this.configureRouterPaths()
	}

	private getCourseFromRouterParamAndSetOnLocals() {
		this.router.param('courseId', async (req, res, next, courseId) => {
			const course = await this.learningCatalogue.getCourse(courseId)

			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})
	}

	private configureRouterPaths() {
		this.router.get('/content-management/courses/:courseId/overview', this.courseOverview())
		this.router.get('/content-management/courses/:courseId/preview', this.coursePreview())

		this.router.get('/content-management/courses/title/:courseId?', this.getCourseTitle())
		this.router.post('/content-management/courses/title/:courseId?', this.setCourseTitle())

		this.router.get('/content-management/courses/details/:courseId?', this.getCourseDetails())
		this.router.post('/content-management/courses/details/:courseId?', this.setCourseDetails())
	}

	public courseOverview() {
		logger.debug('Course Overview page')

		return async (request: Request, response: Response) => {
			const faceToFaceModules = response.locals.course.modules.filter( (module: Module) => module.type == 'face-to-face' );
			response.render('page/course/course-overview', {faceToFaceModules})
		}
	}

	public coursePreview() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-preview')
		}
	}

	public getCourseTitle() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-title')
		}
	}

	public setCourseTitle() {
		return async (request: Request, response: Response) => {
			const errors = await this.courseValidator.check(request.body, ['title'])
			if (errors.size) {
				request.session!.sessionFlash = {errors: errors}
				return response.redirect('/content-management/courses/title')
			}

			if (request.params.courseId) {
				await this.editCourse(request, response)

				return response.redirect(`/content-management/courses/${request.params.courseId}/preview`)
			}

			const course = this.courseFactory.create(request.body)
			request.session!.sessionFlash = {course: course}

			return response.redirect('/content-management/courses/details')
		}
	}

	public getCourseDetails() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-details')
		}
	}

	public setCourseDetails() {
		return async (request: Request, response: Response) => {
			const req = request as ContentRequest

			const data = {
				...req.body,
			}

			const course = this.courseFactory.create(data)

			const errors = await this.courseValidator.check(course)

			if (errors.size) {
				request.session!.sessionFlash = {errors: errors, course: course}
				return response.redirect('/content-management/courses/details')
			}

			if (request.params.courseId) {
				await this.editCourse(request, response)

				return response.redirect(`/content-management/courses/${request.params.courseId}/preview`)
			}

			request.session!.sessionFlash = {courseAddedSuccessMessage: 'course_added_success_message'}

			const savedCourse = await this.learningCatalogue.createCourse(course)

			return response.redirect(`/content-management/courses/${savedCourse.id}/overview`)
		}
	}

	private async editCourse(request: Request, response: Response) {
		const data = {
			...request.body,
			id: response.locals.course.id,
			title: request.body.title || response.locals.course.title,
			description: request.body.description || response.locals.course.description,
			shortDescription: request.body.shortDescription || response.locals.course.shortDescription,
			learningOutcomes: request.body.learningOutcomes || response.locals.course.learningOutcomes,
			modules: request.body.modules || response.locals.course.modules,
		}

		const course = this.courseFactory.create(data)

		await this.learningCatalogue.updateCourse(course)
	}
}
