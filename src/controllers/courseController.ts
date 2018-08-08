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

	public getCourseTitle(edit: Boolean) {
		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const course = req.course

			console.log(request.params)

			response.render('page/add-course-title', {
				edit: edit,
				course: course,
			})
		}
	}

	public setCourseTitle(edit: Boolean) {
		const self = this

		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const course = req.course

			const title = request.body.title

			const errors = await this.courseValidator.check(request.body, [
				'title',
			])
			if (errors.size) {
				return response.render('page/add-course-title', {
					errors: errors,
					edit: edit,
					course: course,
				})
			}

			if (edit) {
				course.title = request.body.title

				await self.learningCatalogue.updateCourse(course)

				response.redirect('/content-management/course/' + course.id)
			} else {
				response.render('page/add-course-details', {
					title: title,
					edit: edit,
					course: course,
				})
			}
		}
	}

	public getCourseDetails(edit: Boolean) {
		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const course = req.course

			response.render('page/add-course-details', {
				edit: edit,
				course: course,
			})
		}
	}

	public setCourseDetails(edit: Boolean) {
		const self = this

		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const data = {
				...req.body,
			}

			const newCourse = this.courseFactory.create(data)

			if (edit) {
				let course = req.course

				const errors = await this.courseValidator.check(newCourse, [
					'description',
					'shortDescription',
				])

				if (errors.size) {
					return response.render('page/add-course-details', {
						title: data.title,
						errors: errors,
						course: course,
						edit: edit,
					})
				}

				course.description = newCourse.description
				course.shortDescription = newCourse.shortDescription
				course.learningOutcomes = newCourse.learningOutcomes

				await self.learningCatalogue.updateCourse(course)

				response.redirect('/content-management/course/' + course.id)
			} else {
				const errors = await this.courseValidator.check(newCourse)

				if (errors.size) {
					return response.render('page/add-course-details', {
						title: data.title,
						errors: errors,
						course: newCourse,
						edit: edit,
					})
				}
				await self.learningCatalogue.createCourse(newCourse)

				response.redirect('/content-management')
			}
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
			response.render(view, {course})
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
