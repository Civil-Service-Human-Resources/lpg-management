import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
// import {CourseRequest} from '../../../src/extended'
import {CourseController} from '../../../src/controllers/courseController'
import {CourseValidator} from '../../../src/learning-catalogue/validator/courseValidator'
import {CourseFactory} from '../../../src/learning-catalogue/model/factory/courseFactory'
import {CourseRequest} from '../../../src/extended'

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

		learningCatalogue.getCourse = sinon.stub().returns(course)

		await courseOverview(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course', {
			course,
			edit: false,
		})
	})

	it('should render add-course-title page', async function() {
		const getCourseTitle: (
			request: Request,
			response: Response
		) => void = courseController.getCourseTitle(false)

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

		courseValidator.check = sinon.stub().returns({fields: [], size: 0})

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
		courseValidator.check = sinon.stub().returns(errors)

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, [
			'title',
		])
		expect(response.render).to.have.been.calledWith(
			'page/add-course-title',
			{errors: errors}
		)
	})

	it('should render add-course-details page', async function() {
		const getCourseDetails: (
			request: Request,
			response: Response
		) => void = courseController.getCourseDetails(false)

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
		learningCatalogue.createCourse = sinon.stub().returns('123')

		courseFactory.create = sinon.stub().returns(course)

		const errors = {fields: [], size: 0}
		courseValidator.check = sinon.stub().returns(errors)

		await setCourseDetails(request, response)
		expect(courseFactory.create).to.have.been.calledWith(request.body)
		expect(courseValidator.check).to.have.been.calledWith(course)
		expect(learningCatalogue.createCourse).to.have.been.calledWith(course)
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

	it('should check for title errors and redirect to course', async function() {
		const course: Course = new Course()
		course.id = 'abc'

		const setCourseTitle: (
			request: Request,
			response: Response
		) => void = courseController.editCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {title: 'New Course'}

		const check = sinon.stub().returns({fields: [], size: 0})
		courseValidator.check = check

		const req = request as CourseRequest
		req.course = course

		const learningCatalogueUpdate = sinon.stub().returns(course)
		learningCatalogue.updateCourse = learningCatalogueUpdate

		const learningCatalogueGet = sinon.stub().returns(course)
		learningCatalogue.getCourse = learningCatalogueGet

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, [
			'title',
		])
		expect(response.redirect).to.have.been.calledWith(
			'/content-management/course/' + course.id
		)
		expect(course.title).to.have.be.eql('New Course')
	})

	it('should check for title errors and render add-course-details', async function() {
		const course: Course = new Course()
		course.id = 'abc'

		const setCourseTitle: (
			request: Request,
			response: Response
		) => void = courseController.editCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {title: 'New Course'}

		const errors = {fields: ['validation.course.title.empty'], size: 1}
		const check = sinon.stub().returns(errors)
		courseValidator.check = check

		const req = request as CourseRequest
		req.course = course

		const learningCatalogueGet = sinon.stub().returns(course)
		learningCatalogue.getCourse = learningCatalogueGet

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, [
			'title',
		])
		expect(response.render).to.have.been.calledWith(
			'page/add-course-title',
			{
				errors: errors,
				edit: true,
				course: course,
			}
		)
	})

	it('should check for description errors and redirect to courses', async function() {
		const course: Course = new Course()
		course.id = 'abc'

		const setCourseDetails: (
			request: Request,
			response: Response
		) => void = courseController.editCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		const check = sinon.stub().returns({fields: [], size: 0})
		courseValidator.check = check

		const req = request as CourseRequest
		req.course = course

		const courseFactoryCreate = sinon.stub().returns(course)
		courseFactory.create = courseFactoryCreate

		const learningCatalogueUpdate = sinon.stub().returns(course)
		learningCatalogue.updateCourse = learningCatalogueUpdate

		const learningCatalogueGet = sinon.stub().returns(course)
		learningCatalogue.getCourse = learningCatalogueGet

		await setCourseDetails(request, response)

		expect(learningCatalogue.updateCourse).to.have.been.calledWith(course)
		expect(courseValidator.check).to.have.been.calledWith(course, [
			'description',
			'shortDescription',
		])
		expect(response.redirect).to.have.been.calledWith(
			'/content-management/course/' + course.id
		)
	})

	it('should check for description errors and render add-course-details', async function() {
		const course: Course = new Course()
		course.id = 'abc'

		const setCourseDetails: (
			request: Request,
			response: Response
		) => void = courseController.editCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {title: 'New Course'}

		const errors = {fields: ['validation.course.title.empty'], size: 1}
		const check = sinon.stub().returns(errors)
		courseValidator.check = check

		const req = request as CourseRequest
		req.course = course

		const courseFactoryCreate = sinon.stub().returns(course)
		courseFactory.create = courseFactoryCreate

		const learningCatalogueGet = sinon.stub().returns(course)
		learningCatalogue.getCourse = learningCatalogueGet

		await setCourseDetails(request, response)

		expect(courseValidator.check).to.have.been.calledWith(course, [
			'description',
			'shortDescription',
		])
		expect(response.render).to.have.been.calledWith(
			'page/add-course-details',
			{
				title: 'New Course',
				errors: errors,
				course: course,
				edit: true,
			}
		)
	})
})
