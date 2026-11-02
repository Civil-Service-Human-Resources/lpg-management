import {describe, it} from 'mocha'
import {HomeController} from '../../../src/controllers/homeController'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Course} from '../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {PaginationService, SearchResponse} from '../../../src/lib/paginationService'
import {getApp} from '../../utils/testApp'

const session = require('supertest-session')

chai.use(sinonChai)

describe('Home Controller Tests', function() {
	const app = getApp()
	let learningCatalogue: sinon.SinonStubbedInstance<LearningCatalogue> = sinon.createStubInstance(LearningCatalogue)
	const pagination = new PaginationService()
	const homeController = new HomeController(learningCatalogue as any, pagination)

	app.use(homeController.path, homeController.buildRouter())
	const course: Course = new Course()
	course.id = 'course-id'
	course.title = 'course-title'
	learningCatalogue.listCourses.resolves({
		query: 'test',
		page: 0,
		size: 10,
		totalResults: 21,
		results: [course],
	} as SearchResponse<Course>)

	it('should render index template with default page and size', async function() {
		const res = await session(app)
			.get('/content-management')
			.send()
		expect(res.status).to.eql(200)
	})

})