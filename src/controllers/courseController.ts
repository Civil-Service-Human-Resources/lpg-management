import {Request, Response, Router} from 'express'
import {CourseFactory} from '../learning-catalogue/model/factory/courseFactory'
import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {Validator} from '../learning-catalogue/validator/validator'
import {Module} from '../learning-catalogue/model/module'
import {CourseService} from '../lib/courseService'
import {CsrsService} from '../csrs/service/csrsService'
import {Audience} from '../learning-catalogue/model/audience'
import {DateTime} from '../lib/dateTime'

export class CourseController {
	learningCatalogue: LearningCatalogue
	courseValidator: Validator<Course>
	courseFactory: CourseFactory
	router: Router
	courseService: CourseService
	csrsService: CsrsService

	constructor(
		learningCatalogue: LearningCatalogue,
		courseValidator: Validator<Course>,
		courseFactory: CourseFactory,
		courseService: CourseService,
		csrsService: CsrsService
	) {
		this.learningCatalogue = learningCatalogue
		this.courseValidator = courseValidator
		this.courseFactory = courseFactory
		this.courseService = courseService
		this.csrsService = csrsService
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

		this.router.get('/content-management/courses/:courseId/sort-modules', this.sortModules())

		this.router.post('/content-management/courses/:courseId/status', this.setStatus())
		this.router.get('/content-management/courses/:courseId/sortDateRanges-modules', this.sortModules())
	}

	courseOverview() {
		return async (req: Request, res: Response) => {
			const faceToFaceModules = res.locals.course.modules.filter(
				(module: Module) => module.type == Module.Type.FACE_TO_FACE
			)
			const departmentCodeToName = await this.csrsService.getDepartmentCodeToNameMapping()
			const gradeCodeToName = await this.csrsService.getGradeCodeToNameMapping()
			const audienceIdToEvent = this.courseService.getAudienceIdToEventMapping(res.locals.course)
			const eventIdToModuleId = this.courseService.getEventIdToModuleIdMapping(res.locals.course)

			const grades = this.courseService.getUniqueGrades(res.locals.course)

			res.render('page/course/course-overview', {
				faceToFaceModules,
				AudienceType: Audience.Type,
				departmentCodeToName,
				gradeCodeToName,
				audienceIdToEvent,
				eventIdToModuleId,
				grades,
			})
		}
	}

	coursePreview() {
		return async (request: Request, response: Response) => {
			const modules: Module[] = response.locals.course.modules

			for (let module of modules) {
				module.formattedDuration = DateTime.formatDuration(module.duration)
			}

			response.render('page/course/course-preview')
		}
	}

	getCourseTitle() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-title')
		}
	}

	setCourseTitle() {
		return async (request: Request, response: Response) => {
			const errors = await this.courseValidator.check(request.body, ['title'])
			if (errors.size) {
				request.session!.sessionFlash = {errors}
				request.session!.save(() => {
					response.redirect('/content-management/courses/title')
				})
			} else if (request.params.courseId) {
				await this.editCourse(request, response)
				response.redirect(`/content-management/courses/${request.params.courseId}/preview`)
			} else {
				const course = this.courseFactory.create(request.body)
				request.session!.sessionFlash = {course}
				request.session!.save(() => {
					response.redirect('/content-management/courses/details')
				})
			}
		}
	}

	getCourseDetails() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-details')
		}
	}

	setCourseDetails() {
		return async (req: Request, res: Response) => {
			const data = {...req.body}
			const course = this.courseFactory.create(data)
			const errors = await this.courseValidator.check(course)

			if (errors.size) {
				req.session!.sessionFlash = {errors: errors, course: course}
				req.session!.save(() => {
					res.redirect('/content-management/courses/details')
				})
			} else if (req.params.courseId) {
				await this.editCourse(req, res)
				res.redirect(`/content-management/courses/${req.params.courseId}/preview`)
			} else {
				const savedCourse = await this.learningCatalogue.createCourse(course)
				res.redirect(`/content-management/courses/${savedCourse.id}/overview`)
			}
		}
	}

	sortModules() {
		return async (request: Request, response: Response) => {
			await this.courseService.sortModules(request.params.courseId, request.query.moduleIds)
			return response.redirect(`/content-management/courses/${request.params.courseId}/add-module`)
		}
	}

	setStatus() {
		return async (request: Request, response: Response) => {
			const errors = await this.courseValidator.check(request.body, ['status'])

			if (errors.size) {
				request.session!.sessionFlash = {errors: errors}
				return request.session!.save(() => {
					response.redirect(`/content-management/courses/${request.params.courseId}/overview`)
				})
			}

			let course = response.locals.course
			course.status = request.body.status

			this.learningCatalogue.updateCourse(course)
			request.session!.save(() => {
				response.redirect(`/content-management/courses/${request.params.courseId}/overview`)
			})
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
