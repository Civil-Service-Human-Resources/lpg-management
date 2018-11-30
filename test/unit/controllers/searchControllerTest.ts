import {beforeEach, describe, it} from 'mocha'
import {SearchController} from '../../../src/controllers/searchController'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {PageResults} from '../../../src/learning-catalogue/model/pageResults'
import {Pagination} from '../../../src/lib/pagination'

chai.use(sinonChai)

describe('Search Controller Tests', function() {
	let searchController: SearchController
	let learningCatalogue: LearningCatalogue
	let pagination: Pagination

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		pagination = new Pagination()
		searchController = new SearchController(learningCatalogue, pagination)
	})

	it('should render search results template with default page, size and search query', async function() {
		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'

		const pageResults: PageResults<Course> = {
			query: 'test',
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
		} as PageResults<Course>

		const listAll = sinon.stub().returns(Promise.resolve(pageResults))

		learningCatalogue.searchCourses = listAll
		const index: (request: Request, response: Response) => void = searchController.searchCourses()

		const request: Request = mockReq()

		const response: Response = mockRes()
		request.query.q = "test"

		await index(request, response)

		expect(learningCatalogue.searchCourses).to.have.been.calledWith('test', 0, 10)

		expect(response.render).to.have.been.calledOnceWith('page/search-results', {pageResults: pageResults, query: "test"})
	})
})
