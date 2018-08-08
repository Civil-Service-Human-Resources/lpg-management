import {Course} from '../../../src/learning-catalogue/model/course'
import {CourseFactory} from '../../../src/learning-catalogue/model/factory/courseFactory'
import {LearningCatalogue} from '../../../src/learning-catalogue/'
import {beforeEach, describe, it} from 'mocha'
import {AxiosInstance, AxiosResponse} from 'axios'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {expect} from 'chai'
import {LearningCatalogueConfig} from '../../../src/learning-catalogue/learningCatalogueConfig'
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Learning Catalogue tests', () => {
	let http: AxiosInstance
	let courseFactory: CourseFactory
	let learningCatalogue: LearningCatalogue
	let config: LearningCatalogueConfig = new LearningCatalogueConfig(
		'username',
		'password',
		'http://localhost'
	)

	beforeEach(() => {
		http = <AxiosInstance>{}
		courseFactory = <CourseFactory>{}
		learningCatalogue = new LearningCatalogue(http, config)
		learningCatalogue.courseFactory = courseFactory
	})

	it('should convert learning catalogue response to paged list of courses', () => {
		const response = {
			data: {
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
			},
		}

		const get = sinon.stub()
		get.withArgs(`${config.url}/courses?page=0&size=10`, {
			auth: {
				username: config.username,
				password: config.password,
			},
		}).returns(
			new Promise(resolve => {
				resolve(response)
			})
		)

		http.get = get

		const course1: Course = new Course()
		course1.id = 'abc'

		const course2: Course = new Course()
		course2.id = 'def'

		const create = sinon.stub()
		create
			.withArgs({
				id: 'abc',
			})
			.returns(course1)
		create
			.withArgs({
				id: 'def',
			})
			.returns(course2)

		courseFactory.create = create

		return learningCatalogue.listAll().then(result => {
			expect(create).to.have.been.calledTwice
			expect(result.results).to.eql([course1, course2])
			expect(result.page).to.eql(0)
			expect(result.size).to.eql(10)
			expect(result.totalResults).to.eql(32)
			expect(get).to.have.been.calledOnceWith(
				`${config.url}/courses?page=0&size=10`,
				{
					auth: {
						username: config.username,
						password: config.password,
					},
				}
			)
		})
	})

	it('should pass page parameters to http call', () => {
		const page: number = 2
		const size: number = 99

		const response = {
			data: {
				results: [],
				page: 0,
				totalResults: 32,
				size: 10,
			},
		}

		http.get = sinon.stub().returns(
			new Promise(resolve => {
				resolve(response)
			})
		)

		courseFactory.create = sinon.stub()

		return learningCatalogue.listAll(page, size).then(result => {
			expect(http.get).to.have.been.calledOnceWith(
				`${config.url}/courses?page=${page}&size=${size}`,
				{
					auth: {
						username: config.username,
						password: config.password,
					},
				}
			)
		})
	})

	it('should return empty list of results if results are null', () => {
		const response = {
			data: {
				results: null,
				page: 0,
				totalResults: 32,
				size: 10,
			},
		}

		const get = sinon
			.stub()
			.returns(
				new Promise((resolve, reject) => {
					resolve(response)
				})
			)
			.withArgs('/courses')

		http.get = get

		const create = sinon.stub()
		courseFactory.create = create

		return learningCatalogue.listAll().then(result => {
			expect(create).to.not.have.been.called
			expect(result.results).to.eql([])
			expect(result.page).to.eql(0)
			expect(result.size).to.eql(10)
			expect(result.totalResults).to.eql(32)
		})
	})

	it('Should throw error if there is a problem with request to learning catalogue', async () => {
		const error: Error = new Error('Error thrown from stub')

		const get = sinon.stub().throws(error)

		http.get = get

		return await expect(learningCatalogue.listAll()).to.be.rejectedWith(
			`Error listing all courses - ${error}`
		)
	})

	it('should pass id to http call and build Course from result', async () => {
		const courseId = 'test-id'
		const response = {
			data: {
				id: courseId,
				title: 'Test Course Title',
				shortDescription: 'Test course short description',
			},
		}

		const course = <Course>{
			id: response.data.id,
			title: response.data.title,
			shortDescription: response.data.shortDescription,
		}

		const get = sinon
			.stub()
			.withArgs(`${config.url}/courses/${courseId}`, {
				auth: {
					username: config.username,
					password: config.password,
				},
			})
			.returns(response)

		http.get = get

		const create = sinon
			.stub()
			.withArgs(response.data)
			.returns(course)

		courseFactory.create = create

		const result: Course = await learningCatalogue.get(courseId)

		expect(result).to.equal(course)
		expect(get).to.have.been.calledOnceWith(
			`${config.url}/courses/${courseId}`,
			{
				auth: {
					username: config.username,
					password: config.password,
				},
			}
		)

		expect(create).to.have.been.calledOnceWith(response.data)
	})

	it('should pass id to http call and build Course from result', async () => {
		const courseId = 'test-id'

		const url = `${config.url}/courses/${courseId}`

		const requestConfig = {
			auth: {
				username: config.username,
				password: config.password,
			},
		}

		const response = {
			data: {
				id: courseId,
				title: 'Test Course Title',
				shortDescription: 'Test course short description',
			},
		}

		const course = <Course>{
			id: response.data.id,
			title: response.data.title,
			shortDescription: response.data.shortDescription,
		}

		const get = sinon
			.stub()
			.withArgs(url, requestConfig)
			.returns(response)

		http.get = get

		const create = sinon
			.stub()
			.withArgs(response.data)
			.returns(course)

		courseFactory.create = create

		const result: Course = await learningCatalogue.get(courseId)

		expect(result).to.equal(course)
		expect(get).to.have.been.calledOnceWith(url, requestConfig)

		expect(create).to.have.been.calledOnceWith(response.data)
	})

	it('should throw error if get fails', async () => {
		const courseId = 'test-id'

		const url = `${config.url}/courses/${courseId}`

		const requestConfig = {
			auth: {
				username: config.username,
				password: config.password,
			},
		}

		const error = new Error('test-error')

		const get = sinon
			.stub()
			.withArgs(url, requestConfig)
			.throws(error)

		http.get = get

		return await expect(learningCatalogue.get(courseId)).to.be.rejectedWith(
			`Error retrieving course: ${error}`
		)
	})

	it('should post course and return result of get', async () => {
		const postUrl = `${config.url}/courses/`
		const courseId = 'test-course-id'

		const requestConfig = {
			auth: {
				username: config.username,
				password: config.password,
			},
		}

		const course: Course = <Course>{
			title: 'Course Title',
			shortDescription: 'Course short description',
			description: 'Course description',
		}

		const postResponse: AxiosResponse = <AxiosResponse>{
			headers: {
				location: `${config.url}/courses/${courseId}`,
			},
		}

		const post = sinon
			.stub()
			.withArgs(postUrl, course, requestConfig)
			.returns(postResponse)

		http.post = post

		const getUrl = `${config.url}/courses/${courseId}`

		const getResponse = {
			data: {
				id: courseId,
				title: 'Test Course Title',
				shortDescription: 'Test course short description',
			},
		}

		const get = sinon
			.stub()
			.withArgs(getUrl, requestConfig)
			.returns(getResponse)

		http.get = get

		const create = sinon
			.stub()
			.withArgs(getResponse.data)
			.returns(course)

		courseFactory.create = create

		const result: Course = await learningCatalogue.create(course)

		expect(result).to.equal(course)

		expect(get).to.have.been.calledOnceWith(getUrl, requestConfig)
		expect(create).to.have.been.calledOnceWith(getResponse.data)
		expect(post).to.have.been.calledOnceWith(postUrl, course, requestConfig)
	})

	it('should throw error if create fails', async () => {
		const url = `${config.url}/courses/`

		const course: Course = <Course>{
			title: 'Course Title',
			shortDescription: 'Course short description',
			description: 'Course description',
		}

		const requestConfig = {
			auth: {
				username: config.username,
				password: config.password,
			},
		}

		const error = new Error('test-error')

		const post = sinon
			.stub()
			.withArgs(url, course, requestConfig)
			.throws(error)

		http.post = post

		return await expect(
			learningCatalogue.create(course)
		).to.be.rejectedWith(`Error creating course: ${error}`)
	})

	it('should update and return result of get', async () => {
		const course: Course = <Course>{
			id: 'test-course-id',
			title: 'Course Title',
			shortDescription: 'Course short description',
			description: 'Course description',
		}

		const putUrl = `${config.url}/courses/${course.id}`

		const requestConfig = {
			auth: {
				username: config.username,
				password: config.password,
			},
		}

		const putResponse = {
			data: {
				id: 'test-course-id',
				title: 'Course Title',
				shortDescription: 'Course short description',
				description: 'Course description',
			},
		}

		const put = sinon
			.stub()
			.withArgs(putUrl, course, requestConfig)
			.returns(putResponse)

		http.put = put

		const getUrl = `${config.url}/courses/${course.id}`

		const getResponse = {
			data: {
				id: 'test-course-id',
				title: 'Course Title',
				shortDescription: 'Course short description',
				description: 'Course description',
			},
		}

		const get = sinon
			.stub()
			.withArgs(getUrl, requestConfig)
			.returns(getResponse)

		http.get = get

		const learningCatalogueGet = sinon.stub().returns(course)
		learningCatalogue.get = learningCatalogueGet

		const result: Course = await learningCatalogue.update(course)

		expect(learningCatalogue.get).to.have.been.calledOnceWith(course.id)
		expect(http.put).to.have.been.calledOnceWith(
			putUrl,
			course,
			requestConfig
		)
		expect(result).to.equal(course)
	})

	it('should throw error if update fails', async () => {
		const course: Course = <Course>{}

		const putUrl = `${config.url}/courses/${course.id}`

		const requestConfig = {
			auth: {
				username: config.username,
				password: config.password,
			},
		}

		const error = new Error('test-error')

		const put = sinon
			.stub()
			.withArgs(putUrl, course, requestConfig)
			.throws(error)

		http.put = put

		return await expect(
			learningCatalogue.update(course)
		).to.be.rejectedWith(`Error updating course: ${error}`)
	})
})
