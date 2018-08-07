import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {NextFunction, Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {CourseRequest} from '../../../src/extended'
import {CourseController} from '../../../src/controllers/courseController'
import {CourseValidator} from '../../../src/learning-catalogue/validator/courseValidator'
import {CourseFactory} from '../../../src/learning-catalogue/model/factory/courseFactory'

chai.use(sinonChai)

describe('Course Controller Tests', function() {
	let courseController: CourseController
	let learningCatalogue: LearningCatalogue
	let courseValidator: CourseValidator
	let courseFactory: CourseFactory

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		courseValidator = <CourseValidator>{}
		courseFactory = <CourseFactory>{}

		courseController = new CourseController(
			learningCatalogue,
			courseValidator,
			courseFactory
		)
	})

	it('should call course overview page', async function() {
		const course: Course = new Course()
		course.id = 'courseOverview-id'
		course.title = 'courseOverview-title'

		const courseOverview: (
			request: Request,
			response: Response
		) => void = courseController.courseOverview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const req = request as CourseRequest
		req.course = course

		await courseOverview(req, response)

		expect(response.render).to.have.been.calledOnceWith('page/course', {
			course,
		})
	})

	it('should call loadCourse', async function() {
		const courseId: string = 'abc'

		const loadCourse: (
			request: Request,
			response: Response,
			next: NextFunction
		) => void = courseController.loadCourse()

		const request: Request = mockReq()
		const response: Response = mockRes()
		const next: NextFunction = sinon.stub()

		const course: Course = new Course()
		course.id = 'course-id'

		const get = sinon.stub().returns(course)
		learningCatalogue.get = get

		const req = request as CourseRequest
		req.params.courseId = courseId

		await loadCourse(req, response, next)

		expect(learningCatalogue.get).to.have.been.calledWith(courseId)
		expect(req.course).to.have.be.eql(course)
		expect(next).to.have.been.calledOnce
	})

	it('should return 404 if course does not exist', async function() {
		const courseId: string = 'abc'

		const loadCourse: (
			request: Request,
			response: Response,
			next: NextFunction
		) => void = courseController.loadCourse()

		const request: Request = mockReq()
		const response: Response = mockRes()
		const next: NextFunction = sinon.stub()

		const get = sinon.stub().returns(null)
		learningCatalogue.get = get

		const req = request as CourseRequest
		req.params.courseId = courseId

		await loadCourse(req, response, next)

		expect(learningCatalogue.get).to.have.been.calledWith(courseId)
		expect(req.course).to.have.be.eql(undefined)
		expect(next).to.have.not.been.calledOnce
		expect(response.sendStatus).to.have.been.calledWith(404)
	})

	it('should render add-course-title page', async function() {
		const getCourseTitle: (
			request: Request,
			response: Response
		) => void = courseController.getCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getCourseTitle(request, response)

		expect(response.render).to.have.been.calledWith('page/add-course-title')
	})

	it('should check for title errors and render details page', async function() {
		const setCourseTitle: (
			request: Request,
			response: Response
		) => void = courseController.setCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {title: 'New Course'}

		const check = sinon.stub().returns({fields: [], size: 0})
		courseValidator.check = check

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, [
			'title',
		])
		expect(response.render).to.have.been.calledWith(
			'page/add-course-details',
			{title: 'New Course'}
		)
	})

	it('should check for title errors and render title page with errors', async function() {
		const setCourseTitle: (
			request: Request,
			response: Response
		) => void = courseController.setCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()
		request.body = {title: ''}

		const errors = {fields: ['validation.course.title.empty'], size: 1}
		const check = sinon.stub().returns(errors)
		courseValidator.check = check

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, [
			'title',
		])
		expect(response.render).to.have.been.calledWith(
			'page/add-course-title',
			{errors: errors, edit: false}
		)
	})

	it('should render add-course-details page', async function() {
		const getCourseDetails: (
			request: Request,
			response: Response
		) => void = courseController.getCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getCourseDetails(request, response)

		expect(response.render).to.have.been.calledWith(
			'page/add-course-details'
		)
	})

	it('should check for description errors and redirect to content-management page', async function() {
		const setCourseDetails: (
			request: Request,
			response: Response
		) => void = courseController.setCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {
			title: 'New Course',
			description: 'desc',
			shortDescription: 'short',
			learningOutcomes: 'outcomes',
		}

		const course = new Course()
		const learningFactoryCreate = sinon.stub().returns('123')
		learningCatalogue.create = learningFactoryCreate

		const courseFactoryCreate = sinon.stub().returns(course)
		courseFactory.create = courseFactoryCreate

		const errors = {fields: [], size: 0}
		const check = sinon.stub().returns(errors)
		courseValidator.check = check

		await setCourseDetails(request, response)
		expect(courseFactory.create).to.have.been.calledWith(request.body)
		expect(courseValidator.check).to.have.been.calledWith(course)
		expect(learningCatalogue.create).to.have.been.calledWith(course)
		expect(response.redirect).to.have.been.calledWith('/content-management')
	})

	it('should check for description errors and render add-course-details', async function() {
		const setCourseDetails: (
			request: Request,
			response: Response
		) => void = courseController.setCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {
			title: 'New Course',
			description: 'desc',
			shortDescription: 'short',
			learningOutcomes: 'outcomes',
		}

		const course = new Course()
		const learningFactoryCreate = sinon.stub().returns('123')
		learningCatalogue.create = learningFactoryCreate

		const courseFactoryCreate = sinon.stub().returns(course)
		courseFactory.create = courseFactoryCreate

		const errors = {
			fields: ['validation.course.description.empty'],
			size: 1,
		}
		const check = sinon.stub().returns(errors)
		courseValidator.check = check

		await setCourseDetails(request, response)

		expect(courseFactory.create).to.have.been.calledWith(request.body)
		expect(courseValidator.check).to.have.been.calledWith(course)
		expect(response.render).to.have.been.calledWith(
			'page/add-course-details',
			{
				title: 'New Course',
				errors: errors,
				course: course,
				edit: false,
			}
		)
	})
})
