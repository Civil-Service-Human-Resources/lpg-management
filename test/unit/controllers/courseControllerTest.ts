import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {NextFunction, Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {CourseController} from '../../../src/controllers/courseController'
import {CourseFactory} from '../../../src/learning-catalogue/model/factory/courseFactory'
import {Validator} from '../../../src/learning-catalogue/validator/validator'
import {Module} from '../../../src/learning-catalogue/model/module'
import {CourseService} from '../../../src/lib/courseService'
import {CsrsService} from '../../../src/csrs/service/csrsService'
import {Status} from '../../../src/learning-catalogue/model/status'
import {Visibility} from '../../../src/learning-catalogue/model/visibility'

chai.use(sinonChai)

describe('Course Controller Tests', function() {
	let courseController: CourseController
	let learningCatalogue: LearningCatalogue
	let validator: Validator<Course>
	let courseFactory: CourseFactory
	let courseService: CourseService
	let csrsService: CsrsService

	let req: Request
	let res: Response
	const next: NextFunction = sinon.stub()

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		courseFactory = <CourseFactory>{}
		validator = <Validator<Course>>{}
		courseService = <CourseService>{}
		csrsService = <CsrsService>{}

		courseController = new CourseController(learningCatalogue, validator, courseFactory, courseService, csrsService)

		req = mockReq()
		res = mockRes()
		req.session!.save = callback => {
			callback(undefined)
		}
	})

	describe('Course overview', () => {
		it('should call course overview page', async function() {
			const courseOverview: (request: Request, response: Response) => void = courseController.courseOverview()

			csrsService.getDepartmentCodeToNameMapping = sinon.stub()
			csrsService.getGradeCodeToNameMapping = sinon.stub()
			courseService.getAudienceIdToEventMapping = sinon.stub()
			courseService.getEventIdToModuleIdMapping = sinon.stub()
			courseService.getCourseUrl = sinon.stub().returns('https://localhost/course/abc123')
			courseService.getUniqueGrades = sinon.stub().returns(['G1', 'G2', 'G3'])
			courseService.sortAudiences = sinon.stub().resolves([])

			const course = new Course()
			course.modules = []
			res.locals.course = course

			await courseOverview(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/course-overview')
			expect(courseService.getUniqueGrades).to.have.been.calledOnceWith(course)
		})
	})

	describe('Course preview', () => {
		it('should render course preview page', async function() {
			const course: Course = new Course()
			const module: Module = new Module()

			module.duration = 3600
			course.modules = [module]
			res.locals.course = course

			await courseController.coursePreview()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/course-preview')
		})

		it('should render course preview page with duration 0m', async function() {
			const course: Course = new Course()
			const module: Module = new Module()

			module.duration = 0
			module.formattedDuration = '0 minutes'
			course.modules = [module]

			const coursePreview: (request: Request, response: Response) => void = courseController.coursePreview()

			res.locals.course = course

			await coursePreview(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/course-preview')
			expect(course.modules[0].formattedDuration).to.equal('0 minutes')
		})
	})

	describe('Course visibility', () => {
		it('should render course visibility page', async () => {
			await courseController.getCourseVisibility()(req, res)
			expect(res.render).to.have.been.calledOnceWith('page/course/course-visibility')
		})

		it('should check for visibility errors and redirect to title page if no errors', async function() {
			const errors = {fields: [], size: 0}
			const course = new Course()
			course.visibility = Visibility.PUBLIC

			courseFactory.create = sinon.stub().returns(course)
			validator.check = sinon.stub().returns({fields: [], size: 0})

			await courseController.setCourseVisibility()(req, res)

			expect(validator.check).to.have.been.calledOnceWith(req.body, ['visibility'])
			expect(validator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash.course).to.be.equal(course)
			expect(res.redirect).to.have.been.calledOnceWith('/content-management/courses/title/')
		})
	})

	describe('Course title', () => {
		it('should render add-course-title page', async function() {
			await courseController.getCourseTitle()(req, res)
			expect(res.render).to.have.been.calledWith('page/course/course-title')
		})

		it('should check for title errors and redirect to details page if no errors', async function() {
			const errors = {fields: [], size: 0}
			const course = new Course()
			course.title = 'New Course'
			course.topicId = 'topicId'

			courseFactory.create = sinon.stub().returns(course)
			validator.check = sinon.stub().returns({fields: [], size: 0})

			const action = courseController.createCourseTitle()
			await action(req, res)

			expect(validator.check).to.have.been.calledWith(req.body, ['title'])
			expect(validator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash.course).to.be.equal(course)
			expect(res.redirect).to.have.been.calledWith('/content-management/courses/details')
		})

		it('should check for title errors and render title page with errors if errors present', async function() {
			req.body = {title: ''}
			const errors = {fields: ['validation.course.title.empty'], size: 1}

			validator.check = sinon.stub().returns(errors)

			await courseController.createCourseTitle()(req, res)

			expect(validator.check).to.have.been.calledWith(req.body, ['title'])
			expect(validator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash.errors).to.be.equal(errors)
			expect(req.session!.sessionFlash.form).to.be.equal(req.body)
			expect(res.redirect).to.have.been.calledWith('/content-management/courses/title/')
		})

		it('should update title if no errors thrown', async function() {
			const course: Course = new Course()
			const courseId = 'abc123'

			req.params.courseId = courseId

			req.body = {
				title: 'New Title',
				id: courseId,
				topicId: 'topicId',
			}

			res.locals.course = <Course>{
				id: courseId,
				title: 'Old Title',
				topicId: 'topicId',
			}

			validator.check = sinon.stub().returns({fields: [], size: 0})
			learningCatalogue.updateCourse = sinon.stub().returns(Promise.resolve(course))

			await courseController.updateCourseTitle()(req, res, next)

			expect(validator.check).to.have.been.calledWith(req.body, ['title'])
			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith(req.body)
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${req.params.courseId}/preview`)
		})

		it('should update title and pass to next if error thrown', async function() {
			const error: any = new Error()
			res.locals.course = new Course()
			req.body.title = 'title'

			validator.check = sinon.stub().returns({fields: [], size: 0})
			learningCatalogue.updateCourse = sinon.stub().returns(Promise.reject(error))

			await courseController.updateCourseTitle()(req, res, next)

			expect(validator.check).to.have.been.calledWith(req.body, ['title'])
			expect(next).to.have.been.calledWith(error)
		})
	})

	describe('Course details', () => {
		it('should render add-course-details page', async function() {
			await courseController.getCourseDetails()(req, res)
			expect(res.render).to.have.been.calledWith('page/course/course-details')
		})

		it('should check for details errors and redirect to content-management page if no errors', async function() {
			req.body = {
				title: 'New Course',
				description: 'desc',
				shortDescription: 'short',
				learningOutcomes: 'outcomes',
			}
			const course = new Course()
			course.id = '123'
			const noErrors = {fields: [], size: 0}

			learningCatalogue.createCourse = sinon.stub().returns(Promise.resolve(course))
			courseFactory.create = sinon.stub().returns(course)
			validator.check = sinon.stub().returns(noErrors)

			await courseController.createCourseDetails()(req, res, next)

			expect(courseFactory.create).to.have.been.calledWith(req.body)
			expect(validator.check).to.have.been.calledWith(req.body, ['shortDescription', 'description'])
			expect(validator.check).to.have.returned(noErrors)
			expect(learningCatalogue.createCourse).to.have.been.calledWith(course)
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${course.id}/overview`)
		})

		it('should try and create and pass to next if error thrown', async function() {
			const error: any = new Error()
			error.response = {status: 403}

			const course = new Course()
			course.id = '123'

			const noErrors = {fields: [], size: 0}
			validator.check = sinon.stub().returns(noErrors)

			courseFactory.create = sinon.stub().returns(course)
			learningCatalogue.createCourse = sinon.stub().returns(Promise.reject(error))

			await courseController.createCourseDetails()(req, res, next)

			expect(validator.check).to.have.been.calledWith(req.body, ['shortDescription', 'description'])
			expect(next).to.have.been.calledWith(error)
		})

		it('should check for description errors and render add-course-details if errors present', async function() {
			req.body = {
				title: 'New Course',
				description: 'desc',
				shortDescription: 'short',
				learningOutcomes: 'outcomes',
			}
			const course = new Course()
			const errors = {
				fields: ['validation.course.description.empty'],
				size: 1,
			}

			learningCatalogue.createCourse = sinon.stub().returns('123')
			courseFactory.create = sinon.stub().returns(course)
			validator.check = sinon.stub().returns(errors)

			await courseController.createCourseDetails()(req, res, next)
			expect(courseFactory.create).to.not.have.been.called
			expect(learningCatalogue.createCourse).to.not.have.been.called

			expect(validator.check).to.have.been.calledWith(req.body, ['shortDescription', 'description'])
			expect(validator.check).to.have.returned(errors)

			expect(req.session!.sessionFlash.errors).to.be.equal(errors)
			expect(req.session!.sessionFlash.form).to.eql(req.body)
			expect(req.session!.sessionFlash).to.not.contain({
				courseAddedSuccessMessage: 'course_added_success_message',
			})
			expect(res.redirect).to.have.been.calledWith('/content-management/courses/details')
		})

		it('should update course details', async function() {
			req.body = {
				id: 'abc123',
				shortDescription: 'Updated short description',
				description: 'Updated description',
				learningOutcomes: 'Updated learning outcomes',
				preparation: 'Updated preparation',
			}

			req.params.courseId = 'abc123'
			const course: Course = new Course()
			res.locals.course = course

			validator.check = sinon.stub().returns({fields: [], size: 0})
			learningCatalogue.updateCourse = sinon.stub().returns(Promise.resolve(course))

			await courseController.updateCourseDetails()(req, res, next)

			expect(validator.check).to.have.been.calledWith(req.body, ['shortDescription', 'description'])

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith(res.locals.course)
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${req.params.courseId}/preview`)
			expect(res.locals.course.shortDescription).to.equal(req.body.shortDescription)
			expect(res.locals.course.description).to.equal(req.body.description)
			expect(res.locals.course.learningOutcomes).to.equal(req.body.learningOutcomes)
			expect(res.locals.course.preparation).to.equal(req.body.preparation)
		})

		it('should try and update and pass to next if error thrown', async function() {
			const error: any = new Error()
			error.response = {status: 403}

			const course = new Course()
			res.locals.course = course

			req.body = {
				id: 'abc123',
				shortDescription: 'Updated short description',
				description: 'Updated description',
				learningOutcomes: 'Updated learning outcomes',
				preparation: 'Updated preparation',
			}

			const noErrors = {fields: [], size: 0}
			validator.check = sinon.stub().returns(noErrors)

			courseFactory.create = sinon.stub().returns(course)
			learningCatalogue.updateCourse = sinon.stub().returns(Promise.reject(error))

			await courseController.updateCourseDetails()(req, res, next)

			expect(validator.check).to.have.been.calledWith(req.body, ['shortDescription', 'description'])
			expect(next).to.have.been.calledWith(error)
		})

		it('should render validation errors on course details update', async function() {
			const courseId = 'course-id'

			req.body = {
				id: courseId,
				shortDescription: 'Short description...',
				description: 'Description...',
				preparation: 'Preparation...',
			}

			res.locals.course = {
				id: courseId,
				shortDescription: 'Old Short description...',
				description: 'Old description...',
				preparation: 'Old preparation...',
			}
			const errors = {
				size: 1,
				fields: [
					{
						status: ['course.validation.status.invalid'],
					},
				],
			}
			validator.check = sinon.stub().returns(errors)
			learningCatalogue.updateCourse = sinon.stub()

			await courseController.updateCourseDetails()(req, res, next)

			expect(validator.check).to.have.been.calledWith(req.body, ['shortDescription', 'description'])
			expect(validator.check).to.have.returned(errors)
			expect(learningCatalogue.updateCourse).to.not.have.been.called
			expect(req.session!.sessionFlash).to.eql({
				errors: errors,
				form: req.body,
			})
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/details/:courseId`)
		})
	})

	describe('Sort modules', () => {
		it('should re-sort modules with order list of module ids', async () => {
			const moduleIds = ['1', '2', '3']
			const courseId = 'course-id'
			req.params.courseId = courseId
			req.query.moduleIds = moduleIds
			const course = new Course()
			res.locals.course = course

			courseService.sortModules = sinon
				.stub()
				.withArgs(courseId, moduleIds)
				.returns(Promise.resolve(course))

			await courseController.sortModules()(req, res, next)

			expect(courseService.sortModules).to.have.been.calledWith(course, moduleIds)
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${courseId}/add-module`)
		})

		it('should pass error to next if sort is rejected', async () => {
			const moduleIds = ['1', '2', '3']
			const courseId = 'course-id'
			req.params.courseId = courseId
			req.query.moduleIds = moduleIds
			const course = new Course()
			res.locals.course = course

			const error = new Error()

			courseService.sortModules = sinon
				.stub()
				.withArgs(courseId, moduleIds)
				.returns(Promise.reject(error))

			await courseController.sortModules()(req, res, next)

			expect(courseService.sortModules).to.have.been.calledWith(course, moduleIds)
			expect(next).to.have.been.calledWith(error)
		})

		it('should flatten grades for all audiences', async () => {
			const audiences: any[] = [
				{
					grades: ['a', 'b', 'c'],
				},
				{
					grades: ['d', 'e', 'f'],
				},
			]

			const allGrades = [].concat.apply([], audiences.map(audience => audience.grades))

			expect(allGrades).to.eql(['a', 'b', 'c', 'd', 'e', 'f'])
		})
	})

	describe('Publish course', () => {
		it('should publish', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Published',
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save: (x: any) => {
						x()
					},
				},
			})
			const response = mockRes({
				locals: {
					course: course,
				},
			})

			const errors = {
				size: 0,
			}

			response.redirect = sinon.stub().returns('hello')
			validator.check = sinon.stub().returns(errors)
			learningCatalogue.publishCourse = sinon.stub().returns(Promise.resolve(course))

			await courseController.publishCourse()(request, response, next)

			expect(validator.check).to.have.been.calledOnceWith(request.body)
			expect(course.status).to.equal(Status.PUBLISHED)
			expect(learningCatalogue.publishCourse).to.have.been.calledWith(course)
			expect(response.redirect).to.have.been.calledWith('/content-management/courses/course-id/overview')
		})

		it('should pass error to next if publish rejected', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Published',
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save: (x: any) => {
						x()
					},
				},
			})
			const response = mockRes({
				locals: {
					course: course,
				},
			})

			const errors = {
				size: 0,
			}

			const error = new Error()

			response.redirect = sinon.stub().returns('hello')
			validator.check = sinon.stub().returns(errors)
			learningCatalogue.publishCourse = sinon.stub().returns(Promise.reject(error))

			await courseController.publishCourse()(request, response, next)

			expect(validator.check).to.have.been.calledOnceWith(request.body)
			expect(course.status).to.equal(Status.PUBLISHED)
			expect(learningCatalogue.publishCourse).to.have.been.calledOnceWith(course)
			expect(next).to.have.been.calledWith(error)
		})

		it('should not update if status is invalid', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Not a status',
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save: (x: any) => {
						x()
					},
				},
			})
			const response = mockRes({
				locals: {
					course: course,
				},
			})

			const errors = {
				size: 1,
				fields: [
					{
						status: ['course.validation.status.invalid'],
					},
				],
			}

			validator.check = sinon.stub().returns(errors)
			learningCatalogue.publishCourse = sinon.stub()

			await courseController.publishCourse()(request, response, next)

			expect(learningCatalogue.publishCourse).to.not.have.been.called
			expect(request.session.sessionFlash).to.eql({
				errors: errors,
				form: request.body,
			})
			expect(response.redirect).to.have.been.calledOnceWith('/content-management/courses/course-id/overview')
		})
	})

	describe('Archive course', () => {
		it('should archive', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Archived',
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save: (x: any) => {
						x()
					},
				},
			})
			const response = mockRes({
				locals: {
					course: course,
				},
			})

			const errors = {
				size: 0,
			}

			response.redirect = sinon.stub().returns('hello')
			validator.check = sinon.stub().returns(errors)
			learningCatalogue.archiveCourse = sinon.stub().returns(Promise.resolve(course))

			await courseController.archiveCourse()(request, response, next)

			expect(validator.check).to.have.been.calledOnceWith(request.body)
			expect(course.status).to.equal(Status.ARCHIVED)
			expect(learningCatalogue.archiveCourse).to.have.been.calledWith(course)
			expect(response.redirect).to.have.been.calledWith('/content-management/courses/course-id/overview')
		})

		it('should pass error to next if archiveCourse rejected', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Published',
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save: (x: any) => {
						x()
					},
				},
			})
			const response = mockRes({
				locals: {
					course: course,
				},
			})

			const errors = {
				size: 0,
			}

			const error = new Error()

			response.redirect = sinon.stub().returns('hello')
			validator.check = sinon.stub().returns(errors)
			learningCatalogue.archiveCourse = sinon.stub().returns(Promise.reject(error))

			await courseController.archiveCourse()(request, response, next)

			expect(validator.check).to.have.been.calledOnceWith(request.body)
			expect(course.status).to.equal(Status.PUBLISHED)
			expect(learningCatalogue.archiveCourse).to.have.been.calledOnceWith(course)
			expect(next).to.have.been.calledWith(error)
		})

		it('should not update if status is invalid', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Not a status',
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save: (x: any) => {
						x()
					},
				},
			})
			const response = mockRes({
				locals: {
					course: course,
				},
			})

			const errors = {
				size: 1,
				fields: [
					{
						status: ['course.validation.status.invalid'],
					},
				],
			}

			validator.check = sinon.stub().returns(errors)
			learningCatalogue.archiveCourse = sinon.stub()

			await courseController.archiveCourse()(request, response, next)

			expect(learningCatalogue.archiveCourse).to.not.have.been.called
			expect(request.session.sessionFlash).to.eql({
				errors: errors,
				form: request.body,
			})
			expect(response.redirect).to.have.been.calledOnceWith('/content-management/courses/course-id/overview')
		})
	})

	describe('Course archive', () => {
		it('should render archive page', async () => {
			await courseController.getArchiveConfirmation()(req, res)
			expect(res.render).to.have.been.calledOnceWith('page/course/archive')
		})
	})
})
