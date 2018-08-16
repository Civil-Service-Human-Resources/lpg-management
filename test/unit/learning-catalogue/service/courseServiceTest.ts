import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {CourseFactory} from '../../../../src/learning-catalogue/model/factory/courseFactory'
import {CourseService} from '../../../../src/learning-catalogue/service/courseService'
import {Course} from '../../../../src/learning-catalogue/model/course'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('CourseService tests', () => {
	let restService: RestService
	let courseFactory: CourseFactory
	let courseService: CourseService

	beforeEach(() => {
		restService = <RestService>{}
		courseFactory = <CourseFactory>{}
		courseService = new CourseService(restService)
		courseService.courseFactory = courseFactory
	})

	it('should convert learning catalogue response to paged list of courses', async () => {
		const data = {
			results: [
				{
					id: 'abc',
				},
				{
					id: 'def',
				},
			],
			page: 0,
			totalResults: 32,
			size: 10,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/courses?page=0&size=10`)
			.returns(data)

		const course1: Course = new Course()
		course1.id = 'abc'

		const course2: Course = new Course()
		course2.id = 'def'

		const createStub = sinon.stub()
		createStub.withArgs({id: 'abc'}).returns(course1)
		createStub.withArgs({id: 'def'}).returns(course2)

		courseFactory.create = createStub

		const result = await courseService.listAll()

		expect(courseFactory.create).to.have.been.calledTwice
		expect(result.results).to.eql([course1, course2])
		expect(result.page).to.eql(0)
		expect(result.size).to.eql(10)
		expect(result.totalResults).to.eql(32)
		expect(restService.get).to.have.been.calledOnceWith(`/courses?page=0&size=10`)
	})

	it('should pass page parameters to http call', async () => {
		const page: number = 2
		const size: number = 99

		const data = {
			results: [],
			page: 0,
			totalResults: 32,
			size: 10,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/courses?page=${page}&size=${size}`)
			.returns(data)

		courseFactory.create = sinon.stub()

		await courseService.listAll(page, size)

		return expect(restService.get).to.have.been.calledOnceWith(`/courses?page=${page}&size=${size}`)
	})

	it('should return empty list of results if results are null', async () => {
		const data = {
			results: null,
			page: 0,
			totalResults: 32,
			size: 10,
		}

		restService.get = sinon
			.stub()
			.returns(data)
			.withArgs('/courses?page=0&size=10')

		courseFactory.create = sinon.stub()

		await courseService.listAll()

		expect(courseFactory.create).to.not.have.been.called
		expect(data.results).to.eql([])
		expect(data.page).to.eql(0)
		expect(data.size).to.eql(10)
		expect(data.totalResults).to.eql(32)
	})

	it('should call RestService to read a course', async () => {
		const courseId = 'test-id'
		const data = {
			id: courseId,
			title: 'Test Course Title',
			shortDescription: 'Test course short description',
		}

		const course = <Course>{
			id: data.id,
			title: data.title,
			shortDescription: data.shortDescription,
		}

		restService.get = sinon
			.stub()
			.withArgs(`/courses/${courseId}`)
			.returns(data)

		courseFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(course)

		const result: Course = await courseService.get(courseId)

		expect(result).to.equal(course)
		expect(restService.get).to.have.been.calledOnceWith(`/courses/${courseId}`)
		expect(courseFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should post course and return result of get', async () => {
		const path = `/courses/`

		const data = {
			title: 'Course Title',
			shortDescription: 'Course short description',
			description: 'Course description',
		}

		const course = <Course>{
			title: 'Course Title',
			shortDescription: 'Course short description',
			description: 'Course description',
		}

		restService.post = sinon
			.stub()
			.withArgs(path, course)
			.returns(data)

		courseFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(course)

		const result: Course = await courseService.create(course)

		expect(result).to.equal(course)

		expect(restService.post).to.have.been.calledOnceWith(path, course)
		expect(courseFactory.create).to.have.been.calledOnceWith(data)
	})
})
