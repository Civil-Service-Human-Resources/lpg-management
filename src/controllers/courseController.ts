import {NextFunction, Request, Response} from 'express'
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
		logger.debug('Loading Course Overview page')
		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const course = req.course

			response.render(`page/course`, {
				course,
			})
		}
	}

	public loadCourse() {
		const self = this

		return async (
			request: Request,
			response: Response,
			next: NextFunction
		) => {
			const req = request as CourseRequest
			const courseId: string = req.params.courseId
			const course = await self.learningCatalogue.get(courseId)
			if (course) {
				req.course = course
				next()
			} else {
				response.sendStatus(404)
			}
		}
	}

	public getCourseTitle() {
		return async (request: Request, response: Response) => {
			response.render('page/add-course-title', {edit: false})
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
			response.render('page/add-course-details', {edit: false})
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
				return response.render('page/add-course-details', {
					title: data.title,
					errors: errors,
					course: course,
				})
			}
			await self.learningCatalogue.create(course)

			response.redirect('/content-management')
		}
	}

	public getEditCourseTitle(){
		return async (request: Request, response: Response) => {
            const req = request as CourseRequest

            const course = req.course

            response.render('page/add-course-title', {
				edit: true,
				course: course,
			})
		}
	}

	public editCourseTitle(){
		const self = this;

		return async (request: Request, response: Response) => {
			const title = request.body.title

            const req = request as CourseRequest

            const course = req.course

			course.title = title;

            const errors = await this.courseValidator.check(request.body, [
                'title',
            ])

			if(errors.size){
				return response.render('page/add-course-title', {
					errors: errors,
					edit: true
				})
			}

			await self.learningCatalogue.update(course)

			response.redirect('/content-management/course/' + course.id)
		}
	}

	public getEditCourseDetails(){
		return async (request: Request, response: Response) => {

            const req = request as CourseRequest

            const course = req.course

			response.render('page/add-course-details', {
				edit: true,
				course: course,
			})
		}
	}

	public editCourseDetails(){
		const self = this

		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const data = {
				...req.body
			}

			const newCourse = this.courseFactory.create(data)
			const errors = await this.courseValidator.check(newCourse, ['description', 'shortDescription'])

            if (errors.size) {
                return response.render('page/add-course-details', {
                    title: data.title,
                    errors: errors,
                    course: newCourse,
					edit: true,
                })
            }

			var course = req.course;

            course.description = newCourse.description
			course.shortDescription = newCourse.shortDescription
			course.learningOutcomes = newCourse.learningOutcomes

			await self.learningCatalogue.update(course)

            response.redirect('/content-management/course/' + course.id)
		}
	}
}
