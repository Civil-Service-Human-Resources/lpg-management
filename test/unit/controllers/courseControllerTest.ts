import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {CourseController} from '../../../src/controllers/courseController'
import {CourseFactory} from '../../../src/learning-catalogue/model/factory/courseFactory'
import {ContentRequest} from '../../../src/extended'
import {Validator} from '../../../src/learning-catalogue/validator/validator'
import {Module} from '../../../src/learning-catalogue/model/module'
import {CourseService} from '../../../src/lib/courseService'
import {CsrsService} from '../../../src/csrs/service/csrsService'
import {Status} from '../../../src/learning-catalogue/model/status'

chai.use(sinonChai)

describe('Course Controller Tests', function() {
	let courseController: CourseController
	let learningCatalogue: LearningCatalogue
	let courseValidator: Validator<Course>
	let courseFactory: CourseFactory
	let courseService: CourseService
	let csrsService: CsrsService

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		courseValidator = <Validator<Course>>{}
		courseFactory = <CourseFactory>{}
		courseService = <CourseService>{}
		csrsService = <CsrsService>{}

		courseController = new CourseController(
			learningCatalogue,
			courseValidator,
			courseFactory,
			courseService,
			csrsService
		)
	})

	it('should call course overview page', async function() {
		const courseOverview: (request: Request, response: Response) => void = courseController.courseOverview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		csrsService.getDepartmentCodeToNameMapping = sinon.stub()
		csrsService.getGradeCodeToNameMapping = sinon.stub()
		courseService.getAudienceIdToEventMapping = sinon.stub()
		courseService.getEventIdToModuleIdMapping = sinon.stub()
		courseService.getUniqueGrades = sinon.stub().returns(['G1','G2', 'G3'])

		const course = new Course()
		course.modules = []
		response.locals.course = course

		await courseOverview(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/course-overview')
		expect(courseService.getUniqueGrades).to.have.been.calledOnceWith(course)
	})

	it('should render course preview page', async function() {
		const course: Course = new Course()
		const module: Module = new Module()

		module.duration = 3600
		course.modules = [module]

		const coursePreview: (request: Request, response: Response) => void = courseController.coursePreview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const req = request as ContentRequest
		req.course = course

		response.locals.course = course

		await coursePreview(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/course-preview')
	})

	it('should render course preview page with duration 0m', async function() {
		const course: Course = new Course()
		const module: Module = new Module()

		module.duration = 0
		course.modules = [module]

		const coursePreview: (request: Request, response: Response) => void = courseController.coursePreview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const req = request as ContentRequest
		req.course = course

		response.locals.course = course

		await coursePreview(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/course-preview')
		expect(course.modules[0].formattedDuration).to.equal('0m')
	})

	it('should render add-course-title page', async function() {
		const getCourseTitle: (request: Request, response: Response) => void = courseController.getCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getCourseTitle(request, response)

		expect(response.render).to.have.been.calledWith('page/course/course-title')
	})

	it('should check for title errors and redirect to details page if no errors', async function() {
		const setCourseTitle: (request: Request, response: Response) => void = courseController.setCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		courseValidator.check = sinon.stub().returns({fields: [], size: 0})

		const errors = {fields: [], size: 0}

		const course = new Course()
		course.title = 'New Course'

		courseFactory.create = sinon.stub().returns(course)

		request.session!.save = callback => {
			callback(undefined)
		}
		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(courseValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash.course).to.be.equal(course)
		expect(response.redirect).to.have.been.calledWith('/content-management/courses/details')
	})

	it('should check for title errors and render title page with errors if errors present', async function() {
		const setCourseTitle: (request: Request, response: Response) => void = courseController.setCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {title: ''}

		const errors = {fields: ['validation.course.title.empty'], size: 1}
		courseValidator.check = sinon.stub().returns(errors)

		request.session!.save = callback => {
			callback(undefined)
		}
		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(courseValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash.errors).to.be.equal(errors)
		expect(response.redirect).to.have.been.calledWith('/content-management/courses/title')
	})

	it('should edit title', async function() {
		const setCourseTitle: (request: Request, response: Response) => void = courseController.setCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {title: ''}
		request.params.courseId = 'abc123'

		const course = new Course()
		course.title = 'New Course'
		course.id = 'abc123'
		response.locals.course = course

		const errors = {fields: [], size: 0}
		courseValidator.check = sinon.stub().returns(errors)

		courseFactory.create = sinon.stub().returns(course)
		learningCatalogue.updateCourse = sinon.stub().returns(course)

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(response.redirect).to.have.been.calledWith(
			`/content-management/courses/${request.params.courseId}/preview`
		)
	})

	it('should render add-course-details page', async function() {
		const getCourseDetails: (request: Request, response: Response) => void = courseController.getCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getCourseDetails(request, response)

		expect(response.render).to.have.been.calledWith('page/course/course-details')
	})

	it('should check for details errors and redirect to content-management page if no errors', async function() {
		const setCourseDetails: (request: Request, response: Response) => void = courseController.setCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {
			title: 'New Course',
			description: 'desc',
			shortDescription: 'short',
			learningOutcomes: 'outcomes',
		}

		const course = new Course()
		learningCatalogue.createCourse = sinon.stub().returns('123')

		courseFactory.create = sinon.stub().returns(course)

		const errors = {fields: [], size: 0}
		courseValidator.check = sinon.stub().returns(errors)

		await setCourseDetails(request, response)

		expect(courseFactory.create).to.have.been.calledWith(request.body)
		expect(courseValidator.check).to.have.been.calledWith(course)
		expect(courseValidator.check).to.have.returned(errors)
		expect(learningCatalogue.createCourse).to.have.been.calledWith(course)
		expect(request.session!.sessionFlash).to.contain({courseAddedSuccessMessage: 'course_added_success_message'})

		expect(response.redirect).to.have.been.calledWith(`/content-management/courses/${course.id}/overview`)
	})

	it('should check for description errors and render add-course-details if errors present', async function() {
		const setCourseDetails: (request: Request, response: Response) => void = courseController.setCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {
			title: 'New Course',
			description: 'desc',
			shortDescription: 'short',
			learningOutcomes: 'outcomes',
		}

		const course = new Course()
		learningCatalogue.createCourse = sinon.stub().returns('123')
		courseFactory.create = sinon.stub().returns(course)

		const errors = {
			fields: ['validation.course.description.empty'],
			size: 1,
		}

		courseValidator.check = sinon.stub().returns(errors)

		await setCourseDetails(request, response)

		expect(courseFactory.create).to.have.been.calledWith(request.body)
		expect(courseValidator.check).to.have.been.calledWith(course)
		expect(courseValidator.check).to.have.returned(errors)
		expect(request.session!.sessionFlash.errors).to.be.equal(errors)
		expect(request.session!.sessionFlash.course).to.be.equal(course)
		expect(request.session!.sessionFlash).to.not.contain({
			courseAddedSuccessMessage: 'course_added_success_message',
		})
		expect(response.redirect).to.have.been.calledWith('/content-management/courses/details')
	})

	it('should edit course details', async function() {
		const setCourseDetails: (request: Request, response: Response) => void = courseController.setCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.courseId = 'abc123'

		const course = new Course()
		course.title = 'New Course'
		course.id = 'abc123'
		response.locals.course = course

		const errors = {fields: [], size: 0}
		courseValidator.check = sinon.stub().returns(errors)

		courseFactory.create = sinon.stub().returns(course)
		learningCatalogue.updateCourse = sinon.stub().returns(course)

		await setCourseDetails(request, response)

		expect(courseValidator.check).to.have.been.calledWith(course)
		expect(response.redirect).to.have.been.calledWith(
			`/content-management/courses/${request.params.courseId}/preview`
		)
	})

	it('should re-sort modules with order list of module ids', async () => {
		const sortModules: (request: Request, response: Response) => void = courseController.sortModules()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.courseId = 'abc123'

		const courseId = 'course-id'
		const moduleIds = ['1', '2', '3']

		request.params.courseId = courseId
		request.query.moduleIds = moduleIds
		const course = new Course()
		response.locals.course = course

		courseService.sortModules = sinon
			.stub()
			.withArgs(courseId, moduleIds)
			.returns(course)

		await sortModules(request, response)

		expect(courseService.sortModules).to.have.been.calledWith(courseId, moduleIds)
		expect(response.redirect).to.have.been.calledWith(`/content-management/courses/${courseId}/add-module`)
	})


	it('should flatten grades for all audiences', async () => {
		const audiences: any[] = [{
			grades: ['a', 'b', 'c'],
		},
		{
			grades: ['d', 'e', 'f'],
		}]

		const allGrades = [].concat.apply([], audiences.map(audience => audience.grades))

		expect(allGrades).to.eql(['a', 'b', 'c', 'd', 'e', 'f'])
	})

	describe('Update status', () => {
		it('should update with valid status', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Published'
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save:(x:any) => {
						x()
					}
				}
			})
			const response = mockRes({
				locals: {
					course: course
				}
			})

			const errors = {
				size:0
			}

			response.redirect = sinon.stub().returns('hello')
			courseValidator.check = sinon.stub().returns(errors)
			learningCatalogue.updateCourse = sinon.stub()

			await courseController.setStatus()(request, response)

			// expect(request.session.save).to.have.been.called
			expect(courseValidator.check).to.have.been.calledOnceWith(request.body)
			expect(course.status).to.equal(Status.PUBLISHED)
			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith(course)
			expect(response.redirect).to.have.been.calledWith('/content-management/courses/course-id/overview')
		})

		it('should not update if status is invalid', async () => {
			let course = new Course()
			course.status = Status.DRAFT

			const request = mockReq({
				originalUrl: 'http://test-url',
				body: {
					status: 'Not a status'
				},
				params: {
					courseId: 'course-id',
				},
				session: {
					save:(x:any) => {
						x()
					}
				}
			})
			const response = mockRes({
				locals: {
					course: course
				}
			})

			const errors= {
				size: 1,
				fields: [
					{
						status: [
							'course.validation.status.invalid'
						]
					}
				]
			}

			courseValidator.check = sinon.stub().returns(errors)
			learningCatalogue.updateCourse = sinon.stub()

			await courseController.setStatus()(request, response)

			expect(learningCatalogue.updateCourse).to.not.have.been.called
			expect(request.session.sessionFlash).to.eql({
				errors: errors
			})
			expect(response.redirect).to.have.been.calledOnceWith('/content-management/courses/course-id/overview')
		})
	})
})
