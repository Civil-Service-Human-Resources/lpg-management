import {Request, Response} from 'express'
import {CourseValidator} from '../learning-catalogue/validator/courseValidator'
import {CourseRequest} from '../extended'
import {CourseFactory} from '../learning-catalogue/model/factory/courseFactory'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../learning-catalogue'

const logger = log4js.getLogger('controllers/courseController')

export class CourseController {
	learningCatalogue: LearningCatalogue
	courseValidator: CourseValidator
	courseFactory: CourseFactory

	constructor(
		learningCatalogue: LearningCatalogue,
		courseValidator: CourseValidator,
		courseFactory: CourseFactory
	) {
		this.learningCatalogue = learningCatalogue
		this.courseValidator = courseValidator
		this.courseFactory = courseFactory
	}

	public courseOverview() {
		logger.debug('Course Overview page')

		return async (request: Request, response: Response) => {
			await this.getCourseAndRenderTemplate(
				request,
				response,
				`page/course`
			)
		}
	}

	public getCourseTitle() {
		return async (request: Request, response: Response) => {
			response.render('page/add-course-title')
		}
	}

	public setCourseTitle() {
		return async (request: Request, response: Response) => {
			const title = request.body.title

			const errors = await this.courseValidator.check(request.body, [
				'title',
			])
			if (errors.size) {
				return response.render('page/add-course-title', {
					errors: errors,
				})
			}
			response.render('page/add-course-details', {title})
		}
	}

	public getCourseDetails() {
		return async (request: Request, response: Response) => {
			response.render('page/add-course-details', {})
		}
	}

	public setCourseDetails() {
		const self = this

		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const data = {
				...req.body,
			}

			let course = this.courseFactory.create(data)

			const errors = await this.courseValidator.check(course)

			if (errors.size) {
				return response.render('page/add-course-details', {
					title: data.title,
					errors: errors,
					course: course,
				})
			}
			course = await self.learningCatalogue.createCourse(course)

			const successMessage = `${
				course.title
			} has been created and saved as a draft`

			request.flash('Added', successMessage)

			response.redirect(`/content-management/course/${course.id}`)
		}
	}

	public coursePreview() {
		return async (request: Request, response: Response) => {
			await this.getCourseAndRenderTemplate(
				request,
				response,
				`page/course-preview`
			)
		}
	}

	private async getCourseAndRenderTemplate(
		request: Request,
		response: Response,
		view: string
	) {
		const courseId: string = request.params.courseId
		const course = await this.learningCatalogue.getCourse(courseId)

		if (course) {
			response.render(view, {course, message: request.flash('Added')})
		} else {
			response.sendStatus(404)
		}
	}

	public addModule() {
		return async (request: Request, response: Response) => {
			response.render(`page/add-module`)
		}
	}

	public addModuleBlog() {
		return async (request: Request, response: Response) => {
			response.render(`page/add-module-blog`)
		}
	}
}
