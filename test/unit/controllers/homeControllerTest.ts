import {beforeEach, describe, it} from 'mocha'
import {HomeController} from '../../../src/controllers/homeController'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {NextFunction, Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {PaginationService, SearchResponse} from '../../../src/lib/paginationService'

chai.use(sinonChai)

describe('Home Controller Tests', function() {
	let homeController: HomeController
	let learningCatalogue: LearningCatalogue
	let pagination: PaginationService

	let request: Request
	let response: Response
	let next: NextFunction

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		pagination = new PaginationService()
		homeController = new HomeController(learningCatalogue, pagination)

		request = mockReq()
		response = mockRes()
		next = sinon.stub()
	})

	it('should render index template with default page and size', async function() {
		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const pageResults: SearchResponse<Course> = {
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
			getPageCount: function() {
				return 3
			}
		} as SearchResponse<Course>

		const listAll = sinon.stub().returns(Promise.resolve(pageResults))
		learningCatalogue.listCourses = listAll

		await homeController.index()(request, response, next)
		expect(learningCatalogue.listCourses).to.have.been.calledWith(0)
		
		expect(response.render).to.have.been.calledOnceWith('page/index')
	})

	it('should call learning catalogue with correct page and size', async function() {
		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const courseResults: SearchResponse<Course> = {
			page: 3,
			size: 10,
			totalResults: 31,
			results: [course]
		} as SearchResponse<Course>

		const pagePagination = {
			pagination: {
				items: [
					{ number: 1, url: "/content-management?p=1" },
					{ ellipsis: true },
					{ number: 3, url: "/content-management?p=3" },
					{ current: true, number: 4, url: "/content-management?p=4" }],
				next: undefined,
				previous: { href: "/content-management?p=3" }
			},
			start: 31,
			total: 31,
			totalPages: 4,
			currentPage: 4,
			end: 31,
		}

		const pageResults = {
			page: 3,
			results: [course],
			size: 10,
			totalResults: 31
		}

		const listAll = sinon.stub().returns(Promise.resolve(courseResults))
		learningCatalogue.listCourses = listAll

		// @ts-ignore
		request.query.p = 4

		await homeController.index()(request, response, next)

		expect(learningCatalogue.listCourses).to.have.been.calledWith(3)

		expect(response.render).to.have.been.calledOnceWith('page/index', {
			pageResults,
			pagePagination
		})
	})

	it('should pass to next if list throws error', async function() {
		const error: Error = new Error()

		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const pageResults: SearchResponse<Course> = {
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
		} as SearchResponse<Course>

		const listAll = sinon.stub().returns(Promise.reject(error))
		learningCatalogue.listCourses = listAll

		// @ts-ignore
		request.query.p = 3

		await homeController.index()(request, response, next)

		expect(learningCatalogue.listCourses).to.have.been.calledWith(2)
		expect(response.render).to.not.have.been.calledOnceWith('page/index', {
			pageResults,
		})
		expect(next).to.have.been.calledWith(error)
	})
})