import {beforeEach, describe, it} from 'mocha'
import {SearchController} from '../../../src/controllers/searchController'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {PaginationService, SearchResponse} from '../../../src/lib/paginationService'

chai.use(sinonChai)

describe('Search Controller Tests', function() {
	let searchController: SearchController
	let learningCatalogue: LearningCatalogue
	let pagination: PaginationService

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		pagination = new PaginationService()
		searchController = new SearchController(learningCatalogue, pagination)
	})

	it('should render search results template with default page, size and search query', async function() {
		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const pageResults: SearchResponse<Course> = {
			query: 'test',
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
		} as SearchResponse<Course>

		const listAll = sinon.stub().returns(Promise.resolve(pageResults))

		learningCatalogue.searchCourses = listAll
		const index: (request: Request, response: Response) => void = searchController.searchCourses()

		const request: Request = mockReq()

		const response: Response = mockRes()
		request.query.q = 'test'

		await index(request, response)

		expect(learningCatalogue.searchCourses).to.have.been.calledWith('test', 0)

		const pagePagination = {
			currentPage: 1,
			end: 1,
			pagination: {
				items: [
					{ current: true, number: 1, url: "/content-management/search?q=test&p=1" },
					{ number: 2, url: "/content-management/search?q=test&p=2" },
					{ number: 3, url: "/content-management/search?q=test&p=3" }
				],
				next: { href: "/content-management/search?q=test&p=2" },
				previous: undefined
			},
			start: 1,
			total: 21,
			totalPages: 3
		}

		expect(response.render).to.have.been.calledOnceWith('page/search-results.njk', {pageResults, pagePagination, query: 'test'})
	})
})
