import {describe, it} from 'mocha'
import {SearchController} from '../../../src/controllers/searchController'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {PaginationService, SearchResponse} from '../../../src/lib/paginationService'
import {SearchService} from '../../../src/learning-catalogue/service/searchService'
import {getApp} from '../../utils/testApp'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {CourseSearchParams} from '../../../src/learning-catalogue/model/search/courseSearchParams'

const session = require('supertest-session')

chai.use(sinonChai)

describe('Search Controller Tests', function() {
	const app = getApp()
	let learningCatalogue: sinon.SinonStubbedInstance<LearningCatalogue> = sinon.createStubInstance(LearningCatalogue)
	const pagination = new PaginationService()
	const searchService = new SearchService(learningCatalogue as any, pagination)
	const controller = new SearchController(searchService)
	app.use(controller.path, controller.buildRouter())
	const course: Course = new Course()
	course.id = 'course-id'
	course.title = 'course-title'
	learningCatalogue.searchCourses.resolves({
		query: 'test',
		page: 0,
		size: 10,
		totalResults: 21,
		results: [course],
	} as SearchResponse<Course>)

	it('should render search results template with default page, size and search query', async function() {
		const res = await session(app)
			.get('/content-management/search?q=test')
			.send()
		expect(res.status).to.eql(200)
		const expectedParams = new CourseSearchParams(0, 10, [], [], 'test',
			[], [], [], undefined, [])
		expect(learningCatalogue.searchCourses).to.be.calledWith(expectedParams)
	})

	it('should render search results template with filters', async function() {
		const course: Course = new Course()
		course.id = 'course-id'
		course.title = 'course-title'
		learningCatalogue.searchCourses.resolves({
			query: 'test',
			page: 0,
			size: 10,
			totalResults: 21,
			results: [course],
		} as SearchResponse<Course>)
		const res = await session(app)
			.get('/content-management/search?q=test&visibility=PUBLIC&status=DRAFT&status=ARCHIVED&courseType=face-to-face')
			.send()
		expect(res.status).to.eql(200)
		const expectedParams = new CourseSearchParams(0, 10, ['DRAFT', 'ARCHIVED'], ['PUBLIC'], 'test',
			[], [], [], undefined, ['face-to-face'])
		expect(learningCatalogue.searchCourses).to.be.calledWith(expectedParams)
	})
})
