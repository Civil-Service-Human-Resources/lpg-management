import {Request, Response, Router} from 'express'
import {CourseValidator} from '../learning-catalogue/validator/courseValidator'
import {CourseRequest} from '../extended'
import {CourseFactory} from '../learning-catalogue/model/factory/courseFactory'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../learning-catalogue'
import * as extended from '../extended'
import * as express from 'express'

const logger = log4js.getLogger('controllers/courseController')

export class CourseController {
	learningCatalogue: LearningCatalogue
	courseValidator: CourseValidator
	courseFactory: CourseFactory
	router: Router

	constructor(learningCatalogue: LearningCatalogue, courseValidator: CourseValidator, courseFactory: CourseFactory) {
		this.learningCatalogue = learningCatalogue
		this.courseValidator = courseValidator
		this.courseFactory = courseFactory
		this.router = express.Router()

		this.setRouterPaths()
	}

	public courseOverview() {
		logger.debug('Course Overview page')

		return async (request: Request, response: Response) => {
			this.getCourseFromReqAndRenderTemplate(request, response, 'page/course', false)
		}
	}

	public getCourseTitle(isEdit: Boolean) {
		return async (request: Request, response: Response) => {
			await this.getCourseFromReqAndRenderTemplate(request, response, 'page/course-title', isEdit)
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
		return async (request: Request, response: Response) => {
			const req = request as extended.CourseRequest
			const course = req.course

			const errors = await this.courseValidator.check(request.body, ['title'])

			if (errors.size) {
				return response.render('page/course-title', {
					errors: errors,
					isEdit: true,
					course: course,
				})
			}

			course.title = request.body.title

			await this.learningCatalogue.updateCourse(course)

			response.redirect('/content-management/course-preview/' + course.id)
		}
	}

	public getCourseDetails(isEdit: Boolean) {
		return async (request: Request, response: Response) => {
			await this.getCourseFromReqAndRenderTemplate(request, response, 'page/course-details', isEdit)
		}
	}

	public setCourseDetails() {
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
			await this.learningCatalogue.createCourse(course)

			response.redirect('/content-management')
		}
	}

	public editCourseDetails() {
		return async (request: Request, response: Response) => {
			const req = request as CourseRequest

			const data = {
				...req.body,
			}

			let course = req.course

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

			await this.learningCatalogue.updateCourse(course)

			response.redirect('/content-management/course-preview/' + course.id)
		}
	}

	public coursePreview() {
		return async (request: Request, response: Response) => {
			this.getCourseFromReqAndRenderTemplate(request, response, 'page/course-preview', false)
		}
	}

	private getCourseFromReqAndRenderTemplate(request: Request, response: Response, view: string, isEdit: Boolean) {
		const req = request as extended.CourseRequest
		const course = req.course

		response.render(view, {course: course, isEdit})
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

	private setRouterPaths() {
		this.router.param('courseId', async (ireq, res, next, courseId) => {
			const req = ireq as extended.CourseRequest
			console.log('getting course ' + courseId)

			const course = await this.learningCatalogue.getCourse(courseId)

			if (course) {
				req.course = course
			} else {
				res.sendStatus(404)
			}
			next()
		})

		this.router.get('/content-management/course/:courseId', this.courseOverview())
		this.router.get('/content-management/add-course/', this.getCourseTitle(false))
		this.router.get('/content-management/edit-course/:courseId', this.getCourseTitle(true))
		this.router.post('/content-management/add-course', this.setCourseTitle())
		this.router.post('/content-management/edit-course/:courseId', this.editCourseTitle())
		this.router.get('/content-management/course-preview/:courseId', this.coursePreview())

		this.router.get('/content-management/add-course-details', this.getCourseDetails(false))
		this.router.get('/content-management/edit-course-details/:courseId', this.getCourseDetails(true))
		this.router.post('/content-management/add-course-details', this.setCourseDetails())
		this.router.post('/content-management/edit-course-details/:courseId', this.editCourseDetails())

		this.router.get('/add-module', this.addModule())
		this.router.get('/add-module-blog', this.addModuleBlog())
	}
}
