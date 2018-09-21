import {Request, Response, Router} from 'express'
import {ContentRequest} from '../extended'
import {CourseFactory} from '../learning-catalogue/model/factory/courseFactory'
import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {Validator} from '../learning-catalogue/validator/validator'
import {Module} from '../learning-catalogue/model/module'
import * as datetime from '../lib/datetime'
import {CourseService} from '../lib/courseService'

export class CourseController {
	learningCatalogue: LearningCatalogue
	courseValidator: Validator<Course>
	courseFactory: CourseFactory
	router: Router
	courseService: CourseService

	constructor(
		learningCatalogue: LearningCatalogue,
		courseValidator: Validator<Course>,
		courseFactory: CourseFactory,
		courseService: CourseService
	) {
		this.learningCatalogue = learningCatalogue
		this.courseValidator = courseValidator
		this.courseFactory = courseFactory
		this.courseService = courseService
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

		this.router.get('/content-management/courses/:courseId/sort-modules?', this.sortModules())
	}

	public courseOverview() {
		return async (request: Request, response: Response) => {
			const faceToFaceModules = response.locals.course.modules.filter(
				(module: Module) => module.type == Module.Type.FACE_TO_FACE
			)
			response.render('page/course/course-overview', {faceToFaceModules})
		}
	}

	public coursePreview() {
		return async (request: Request, response: Response) => {
			const modules: Module[] = response.locals.course.modules

			for (let module of modules) {
				module.formattedDuration = datetime.formatDuration(module.duration)
			}

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
				request.session!.sessionFlash = {errors}
				request.session!.save(() => {
					response.redirect('/content-management/courses/title')
				})
			} else {
				if (request.params.courseId) {
					await this.editCourse(request, response)

					return response.redirect(`/content-management/courses/${request.params.courseId}/preview`)
				}

				const course = this.courseFactory.create(request.body)
				request.session!.sessionFlash = {course}
				request.session!.save(() => {
					response.redirect('/content-management/courses/details')
				})
			}
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

	public sortModules() {
		return async (request: Request, response: Response) => {
			await this.courseService.sortModules(request.params.courseId, request.query.moduleIds)
			return response.redirect(`/content-management/courses/${request.params.courseId}/add-module`)
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
			audiences: request.body.audiences || response.locals.course.audiences,
		}

		const course = this.courseFactory.create(data)

		await this.learningCatalogue.updateCourse(course)
	}
}
