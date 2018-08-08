import {beforeEach, describe, it} from 'mocha'
import {HomeController} from '../../../src/controllers/homeController'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {PageResults} from '../../../src/learning-catalogue/model/pageResults'

chai.use(sinonChai)

describe('Home Controller Tests', function() {
	let homeController: HomeController
	let learningCatalogue: LearningCatalogue

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		homeController = new HomeController(learningCatalogue)
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

		const index: (
			request: Request,
			response: Response
		) => void = homeController.index()

		const request: Request = mockReq()
		const response: Response = mockRes()
		await index(request, response)

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

		const index: (
			request: Request,
			response: Response
		) => void = homeController.index()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.query.p = 3
		request.query.s = 5

		await index(request, response)

		expect(learningCatalogue.listCourses).to.have.been.calledWith(3, 5)

		expect(response.render).to.have.been.calledOnceWith('page/index', {
			pageResults,
		})
	})
})
