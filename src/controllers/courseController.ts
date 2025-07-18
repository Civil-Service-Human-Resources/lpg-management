import _ = require('lodash')

import {NextFunction, Request, Response, Router} from 'express'
import {CourseFactory} from '../learning-catalogue/model/factory/courseFactory'
import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {Validator} from '../learning-catalogue/validator/validator'
import {Module} from '../learning-catalogue/model/module'
import {CourseService} from '../lib/courseService'
import {CsrsService} from '../csrs/service/csrsService'
import {Audience} from '../learning-catalogue/model/audience'
import {DateTime} from '../lib/dateTime'
import {Validate} from './formValidator'
import {FormController} from './formController'
import * as asyncHandler from 'express-async-handler'
import { getLogger } from '../utils/logger'
import {applyLearningCatalogueMiddleware} from './middleware/learningCatalogueMiddleware'
import {roleCheckMiddleware} from './middleware/roleCheckMiddleware'
import {learningArchiveRole, learningPublishRole, learningUnarchiveRole} from '../identity/identity'
const { xss } = require('express-xss-sanitizer')

export class CourseController implements FormController {
	logger = getLogger('CourseController')
	learningCatalogue: LearningCatalogue
	validator: Validator<Course>
	courseFactory: CourseFactory
	router: Router
	courseService: CourseService
	csrsService: CsrsService

	constructor(learningCatalogue: LearningCatalogue, courseValidator: Validator<Course>, courseFactory: CourseFactory, courseService: CourseService, csrsService: CsrsService) {
		this.learningCatalogue = learningCatalogue
		this.validator = courseValidator
		this.courseFactory = courseFactory
		this.courseService = courseService
		this.csrsService = csrsService
		this.router = Router()
		this.configureRouterPaths()
	}

	/* istanbul ignore next */
	private configureRouterPaths() {
		applyLearningCatalogueMiddleware({getModule: false, getEvent: false}, this.router, this.learningCatalogue)
		this.router.get('/content-management/courses/:courseId/overview', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.courseOverview()))
		this.router.get('/content-management/courses/:courseId/preview', xss(), this.checkForEventViewRole(), this.coursePreview())

		this.router.get('/content-management/courses/visibility/:courseId?', xss(), this.getCourseVisibility())
		this.router.post('/content-management/courses/visibility/:courseId?', xss(), this.setCourseVisibility())
		this.router.get('/content-management/courses/title/:courseId?', xss(), this.getCourseTitle())
		this.router.post('/content-management/courses/title/', xss(), this.createCourseTitle())
		this.router.post('/content-management/courses/title/:courseId', xss(), this.updateCourseTitle())

		this.router.get('/content-management/courses/details/:courseId?', xss(), this.getCourseDetails())
		this.router.post('/content-management/courses/details/', xss(), this.createCourseDetails())
		this.router.post('/content-management/courses/details/:courseId', xss(), this.updateCourseDetails())

		this.router.get('/content-management/courses/:courseId/sort-modules', xss(), this.sortModules())
		this.router.get('/content-management/courses/:courseId/archive', asyncHandler(roleCheckMiddleware(learningArchiveRole)), xss(), this.getArchiveConfirmation())
		this.router.post('/content-management/courses/:courseId/status/publish', asyncHandler(roleCheckMiddleware(learningPublishRole)), xss(), this.publishCourse())
		this.router.post('/content-management/courses/:courseId/status/archive', asyncHandler(roleCheckMiddleware(learningArchiveRole)), xss(), this.archiveCourse())
		this.router.post('/content-management/courses/:courseId/status/unarchive', asyncHandler(roleCheckMiddleware(learningUnarchiveRole)), xss(), this.unarchiveCourse())
		this.router.get('/content-management/courses/:courseId/sortDateRanges-modules', xss(), this.sortModules())
	}

	public checkForEventViewRole() {
		return (req: Request, res: Response, next: NextFunction) => {
			if (req.user && req.user.hasEventViewingRole()) {
				next()
			} else {
				if (req.user && req.user.uid) {
					this.logger.error('Rejecting user without event viewing role ' + req.user.uid + ' with IP '
						+ req.ip + ' from page ' + req.originalUrl)
					}
				res.render('page/unauthorised')
			}
		}
	}

	courseOverview() {
		return async (req: Request, res: Response) => {
			const faceToFaceModules = res.locals.course.modules.filter((module: Module) => module.type == Module.Type.FACE_TO_FACE)
			const departmentCodeToName = await this.csrsService.getDepartmentCodeToNameMapping()
			const gradeCodeToName = await this.csrsService.getGradeCodeToNameMapping()
			const audienceIdToEvent = this.courseService.getAudienceIdToEventMapping(res.locals.course)
			const eventIdToModuleId = this.courseService.getEventIdToModuleIdMapping(res.locals.course)

			const grades = this.courseService.getUniqueGrades(res.locals.course)
			const audienceIdToDepsMap: any = {}

			const sortedAudiences = (await this.courseService.sortAudiences(res.locals.course.audiences))
				.map(a => {
					audienceIdToDepsMap[a.id] = (a.departments || [])
						.map(d => departmentCodeToName[d])
						.sort()
					return a
				})

			const courseUrl = this.courseService.getCourseUrl(res.locals.course.id)

			res.render('page/course/course-overview', {
				faceToFaceModules,
				AudienceType: Audience.Type,
				audienceIdToDepsMap,
				gradeCodeToName,
				audienceIdToEvent,
				eventIdToModuleId,
				grades,
				sortedAudiences,
				courseUrl
			})
		}
	}

	coursePreview() {
		return async (request: Request, response: Response) => {
			const modules: Module[] = response.locals.course.modules

			for (let module of modules) {
				if (module.type === Module.Type.FACE_TO_FACE) {
					const events = _.get(module, 'events', [])
					// @ts-ignore
					events.sort(function compare(a, b) {
						const dateA = new Date(_.get(a, 'startDate', ''))
						const dateB = new Date(_.get(b, 'startDate', ''))
						// @ts-ignore
						return dateA - dateB
					})
					if (events && events.length > 0) {
						module.duration = events[0].getDuration()
					}
				}
				module.formattedDuration = DateTime.formatDuration(module.duration)
			}
			response.render('page/course/course-preview')
		}
	}

	getCourseVisibility() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-visibility')
		}
	}

	@Validate({
		fields: ['visibility'],
		redirect: '/content-management/courses/visibility',
	})
	setCourseVisibility() {
		return async (request: Request, response: Response) => {
			const course = this.courseFactory.create(request.body)
			request.session!.sessionFlash = {course}

			request.session!.save(() => {
				response.redirect('/content-management/courses/title/')
			})
		}
	}

	getCourseTitle() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-title')
		}
	}

	@Validate({
		fields: ['title'],
		redirect: '/content-management/courses/title/:courseId',
	})
	updateCourseTitle() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let course = response.locals.course
			course.title = request.body.title
			course.topicId = request.body.topicId

			await this.learningCatalogue
				.updateCourse(course)
				.then(() => {
					response.redirect(`/content-management/courses/${request.params.courseId}/preview`)
				})
				.catch(error => {
					next(error)
				})
		}
	}

	@Validate({
		fields: ['title'],
		redirect: '/content-management/courses/title/',
	})
	createCourseTitle() {
		return async (request: Request, response: Response) => {
			const course = this.courseFactory.create(request.body)
			request.session!.sessionFlash = {course}
			request.session!.save(() => {
				response.redirect('/content-management/courses/details')
			})
		}
	}

	getCourseDetails() {
		return async (request: Request, response: Response) => {
			response.render('page/course/course-details')
		}
	}

	@Validate({
		fields: ['shortDescription', 'description'],
		redirect: '/content-management/courses/details',
	})
	createCourseDetails() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const requestBody = req.body

			const course = this.courseFactory.create(requestBody)

			await this.learningCatalogue
				.createCourse(course)
				.then(savedCourse => {
					req.session!.sessionFlash = {courseSuccessMessage: 'course_added_success_message'}
					req.session!.save(() => {
						res.redirect(`/content-management/courses/${savedCourse.id}/overview`)
					})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	@Validate({
		fields: ['shortDescription', 'description'],
		redirect: '/content-management/courses/details/:courseId',
	})
	updateCourseDetails() {
		return async (req: Request, res: Response, next: NextFunction) => {
			let course = res.locals.course
			course.shortDescription = req.body.shortDescription
			course.description = req.body.description
			course.learningOutcomes = req.body.learningOutcomes
			course.preparation = req.body.preparation

			await this.learningCatalogue
				.updateCourse(course)
				.then(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/preview`)
				})
				.catch(error => {
					next(error)
				})
		}
	}

	sortModules() {
		return async (request: Request, response: Response, next: NextFunction) => {
			return await this.courseService
				// @ts-ignore
				.sortModules(response.locals.course, request.query.moduleIds)
				.then(() => {
					response.redirect(`/content-management/courses/${request.params.courseId}/add-module`)
				})
				// @ts-ignore
				.catch(error => {
					next(error)
				})
		}
	}

	@Validate({
		fields: ['status'],
		redirect: '/content-management/courses/:courseId/overview',
	})
	publishCourse() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let course = response.locals.course

			await this.learningCatalogue
				.publishCourse(course)
				.then(() => {
					request.session!.save(() => {
						response.redirect(`/content-management/courses/${request.params.courseId}/overview`)
					})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	@Validate({
		fields: ['status'],
		redirect: '/content-management/courses/:courseId/overview',
	})
	archiveCourse() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let course = response.locals.course
			await this.learningCatalogue
				.archiveCourse(course)
				.then(() => {
					request.session!.save(() => {
						response.redirect(`/content-management/courses/${request.params.courseId}/overview`)
					})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	getArchiveConfirmation() {
		return async (request: Request, response: Response) => {
			response.render('page/course/archive')
		}
	}

	@Validate({
		fields: ['status'],
		redirect: '/content-management/courses/:courseId/overview',
	})
	private unarchiveCourse() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let course = response.locals.course
			await this.learningCatalogue
				.unarchiveCourse(course)
				.then(() => {
					request.session!.sessionFlash = {courseSuccessMessage: 'course_unarchived_success_message'}
					request.session!.save(() => {
						response.redirect(`/content-management/courses/${request.params.courseId}/overview`)
					})
				})
				.catch(error => {
					next(error)
				})
		}
	}
}
