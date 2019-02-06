import {beforeEach, describe, it} from 'mocha'
import {HomeController} from '../../../src/controllers/homeController'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {NextFunction, Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {PageResults} from '../../../src/learning-catalogue/model/pageResults'
import {Pagination} from '../../../src/lib/pagination'

chai.use(sinonChai)

describe('Home Controller Tests', function() {
	let homeController: HomeController
	let learningCatalogue: LearningCatalogue
	let pagination: Pagination

	let request: Request
	let response: Response
	let next: NextFunction

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		pagination = new Pagination()
		homeController = new HomeController(learningCatalogue, pagination)

		request = mockReq()
		response = mockRes()
		next = sinon.stub()
	})

	it('should render index template with default page and size', async function() {
		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const pageResults: PageResults<Course> = {
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
		} as PageResults<Course>

		const listAll = sinon.stub().returns(Promise.resolve(pageResults))
		learningCatalogue.listCourses = listAll

		await homeController.index()(request, response, next)

		expect(learningCatalogue.listCourses).to.have.been.calledWith(0, 10)

		expect(response.render).to.have.been.calledOnceWith('page/index')
	})

	it('should call learning catalogue with correct page and size', async function() {
		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const pageResults: PageResults<Course> = {
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
		} as PageResults<Course>

		const listAll = sinon.stub().returns(Promise.resolve(pageResults))
		learningCatalogue.listCourses = listAll

		request.query.p = 3
		request.query.s = 5

		await homeController.index()(request, response, next)

		expect(learningCatalogue.listCourses).to.have.been.calledWith(3, 5)

		expect(response.render).to.have.been.calledOnceWith('page/index', {
			pageResults,
		})
	})

	it('should pass to next if list throws error', async function() {
		const error: Error = new Error()

		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const pageResults: PageResults<Course> = {
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
		} as PageResults<Course>

		const listAll = sinon.stub().returns(Promise.reject(error))
		learningCatalogue.listCourses = listAll

		request.query.p = 3
		request.query.s = 5

		await homeController.index()(request, response, next)

		expect(learningCatalogue.listCourses).to.have.been.calledWith(3, 5)
		expect(response.render).to.not.have.been.calledOnceWith('page/index', {
			pageResults,
		})
		expect(next).to.have.been.calledWith(error)
	})
})
