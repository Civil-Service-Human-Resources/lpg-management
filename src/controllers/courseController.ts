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

	constructor(learningCatalogue: LearningCatalogue, courseValidator: CourseValidator, courseFactory: CourseFactory) {
		this.learningCatalogue = learningCatalogue
		this.courseValidator = courseValidator
		this.courseFactory = courseFactory
	}

	public courseOverview() {
		logger.debug('Course Overview page')

		return async (request: Request, response: Response) => {
			await this.getCourseAndRenderTemplate(request, response, `page/course`, false)
		}
	}

	public getCourseTitle(isEdit: Boolean) {
		return async (request: Request, response: Response) => {
			if (isEdit) {
				await this.getCourseAndRenderTemplate(request, response, 'page/course-title', isEdit)
			} else {
				response.render('page/course-title', {
					isEdit: isEdit,
				})
			}
		}
	}

	public setCourseTitle() {
		return async (request: Request, response: Response) => {
			const title = request.body.title

			const errors = await this.courseValidator.check(request.body, ['title'])
			if (errors.size) {
				return response.render('page/course-title', {
					errors: errors,
				})
			}

			response.render('page/course-details', {
				title: title,
			})
		}
	}

	public editCourseTitle() {
		const self = this

		return async (request: Request, response: Response) => {
			const course = await this.learningCatalogue.getCourse(request.params.courseId)

			const errors = await this.courseValidator.check(request.body, ['title'])

			if (errors.size) {
				return response.render('page/course-title', {
					errors: errors,
					isEdit: true,
					course: course,
				})
			}

			course.title = request.body.title

			await self.learningCatalogue.updateCourse(course)

			response.redirect('/content-management/course-preview/' + course.id)
		}
	}

	public getCourseDetails(isEdit: Boolean) {
		return async (request: Request, response: Response) => {
			if (isEdit) {
				await this.getCourseAndRenderTemplate(request, response, 'page/course-details', isEdit)
			} else {
				response.render('page/course-details', {
					idEdit: isEdit,
				})
			}
		}
	}

	public setCourseDetails() {
		const self = this

		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const data = {
				...req.body,
			}

			const course = this.courseFactory.create(data)

			const errors = await this.courseValidator.check(course)

			if (errors.size) {
				return response.render('page/course-details', {
					title: data.title,
					errors: errors,
					course: course,
					isEdit: false,
				})
			}
			await self.learningCatalogue.createCourse(course)

			response.redirect('/content-management')
		}
	}

	public editCourseDetails() {
		const self = this

		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const data = {
				...req.body,
			}

			let course = await this.learningCatalogue.getCourse(request.params.courseId)

			course.description = data.description
			course.shortDescription = data.shortDescription
			course.learningOutcomes = data.learningOutcomes

			const errors = await this.courseValidator.check(course, ['description', 'shortDescription'])

			if (errors.size) {
				return response.render('page/course-details', {
					title: data.title,
					errors: errors,
					course: course,
					isEdit: true,
				})
			}

			await self.learningCatalogue.updateCourse(course)

			response.redirect('/content-management/course-preview/' + course.id)
		}
	}

	public coursePreview() {
		return async (request: Request, response: Response) => {
			await this.getCourseAndRenderTemplate(request, response, `page/course-preview`, false)
		}
	}

	private async getCourseAndRenderTemplate(request: Request, response: Response, view: string, isEdit: Boolean) {
		const courseId: string = request.params.courseId
		const course = await this.learningCatalogue.getCourse(courseId)

		if (course) {
			response.render(view, {course: course, isEdit: isEdit})
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
