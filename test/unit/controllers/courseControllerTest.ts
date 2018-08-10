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

		courseController = new CourseController(learningCatalogue, courseValidator, courseFactory)
	})

	it('should call course overview page', async function() {
		const course: Course = new Course()
		course.id = 'courseOverview-id'
		course.title = 'courseOverview-title'

		const courseOverview: (request: Request, response: Response) => void = courseController.courseOverview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		learningCatalogue.getCourse = sinon.stub().returns(course)

		const successMessage = `${
			course.title
		} has been created and saved as a draft`

		request.flash('Added', successMessage)

		await courseOverview(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course', {
			course,
			message: request.flash('Added'),
		})
	})

	it('should render add-course-title page', async function() {
		const getCourseTitle: (request: Request, response: Response) => void = courseController.getCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getCourseTitle(request, response)

		expect(response.render).to.have.been.calledWith('page/add-course-title')
	})

	it('should check for title errors and render details page', async function() {
		const setCourseTitle: (request: Request, response: Response) => void = courseController.setCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {title: 'New Course'}

		courseValidator.check = sinon.stub().returns({fields: [], size: 0})

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(response.render).to.have.been.calledWith('page/add-course-details', {title: 'New Course'})
	})

	it('should check for title errors and render title page with errors', async function() {
		const setCourseTitle: (request: Request, response: Response) => void = courseController.setCourseTitle()

		const request: Request = mockReq()
		const response: Response = mockRes()
		request.body = {title: ''}

		const errors = {fields: ['validation.course.title.empty'], size: 1}
		courseValidator.check = sinon.stub().returns(errors)

		await setCourseTitle(request, response)

		expect(courseValidator.check).to.have.been.calledWith(request.body, ['title'])
		expect(response.render).to.have.been.calledWith('page/add-course-title', {errors: errors})
	})

	it('should render add-course-details page', async function() {
		const getCourseDetails: (request: Request, response: Response) => void = courseController.getCourseDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getCourseDetails(request, response)

		expect(response.render).to.have.been.calledWith('page/add-course-details')
	})

	it('should check for description errors and redirect to content-management page', async function() {
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
		expect(learningCatalogue.createCourse).to.have.been.calledWith(course)
		expect(response.redirect).to.have.been.calledWith(
			'/content-management/course/' + course.id
		)
		expect(request.flash).to.have.been.calledWith(
			'Added',
			`${course.title} has been created and saved as a draft`
		)
	})

	it('should check for description errors and render add-course-details', async function() {
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
    expect(request.flash).to.not.have.been.called
		expect(response.render).to.have.been.calledWith('page/add-course-details', {
			title: 'New Course',
			errors: errors,
			course: course,
		})
	})
})
