import {AxiosInstance} from 'axios'
import {beforeEach, describe, it} from 'mocha'
import * as sinon from 'sinon'
import * as chaiAsPromised from 'chai-as-promised'
import * as chai from 'chai'

import {expect} from 'chai'
import {LearningCatalogueConfig} from '../../../../src/learning-catalogue/learningCatalogueConfig'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {Course} from '../../../../src/learning-catalogue/model/course'

chai.use(chaiAsPromised)

describe('RestService tests', () => {
	let http: AxiosInstance
	let config = new LearningCatalogueConfig({username: 'test-user', password: 'test-pass'}, 'http://example.org')
	let restService: RestService
	let accessToken: string = 'access-token'
	let requestConfig: object = {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}

	beforeEach(() => {
		http = <AxiosInstance>{
			defaults: {},
		}
		restService = new RestService(config)
		restService.http = http
	})

	it('should return data from GET request', async () => {
		const path = '/courses/course-id'

		const response = {
			data: {
				id: 'course-id',
			},
		}

		http.get = sinon
			.stub()
			.withArgs(path, requestConfig)
			.returns(response)

		const data = await restService.get(path, accessToken)

		return expect(data).to.eql(response.data)
	})

	it('should return data from POST request', async () => {
		const path = '/courses/course-id'

		const course = new Course()

		http.post = sinon
			.stub()
			.withArgs(path, course, requestConfig)
			.returns({
				headers: {
					location: `${config.url}${path}`,
				},
			})

		const getResponse = {
			data: {
				id: 'course-id',
			},
		}

		http.get = sinon
			.stub()
			.withArgs(path, accessToken, requestConfig)
			.returns(getResponse)

		const data = await restService.get(path, accessToken)

		return expect(data).to.eql(getResponse.data)
	})

	it('should throw error if problem with GET request', async () => {
		const path = '/courses/course-id'
		const errorMessage =
			'Error with GET request: Error: Error thrown from test when getting http://example.org/courses/course-id'

		http.get = sinon
			.stub()
			.withArgs(path, requestConfig)
			.throws(new Error('Error thrown from test'))

		return expect(restService.get(path, accessToken)).to.be.rejectedWith(errorMessage)
	})

	it('should throw error if problem with POST request', async () => {
		const path = '/courses/course-id'
		const errorMessage =
			'Error with POST request: Error: Error thrown from test when posting {"id":"course-id"} to http://example.org/courses/course-id'
		const course = <Course>{
			id: 'course-id',
		}

		http.post = sinon
			.stub()
			.withArgs(path, requestConfig)
			.throws(new Error('Error thrown from test'))

		return expect(restService.post(path, course, accessToken)).to.be.rejectedWith(errorMessage)
	})

	it('should return data from PUT request', async () => {
		const path = '/courses/course-id'

		const course = <Course>{
			id: 'course-id',
		}

		const getResponse = {
			data: {
				id: 'course-id',
			},
		}

		http.put = sinon
			.stub()
			.withArgs(path, course, requestConfig)
			.returns(getResponse)

		const data = await restService.put(path, course, accessToken)

		return expect(data).to.eql(getResponse.data)
	})

	it('should throw error if problem with PUT request', async () => {
		const path = '/courses/course-id'
		const errorMessage =
			'Error with PUT request: Error: Error thrown from test when putting {"id":"course-id"} to http://example.org/courses/course-id'

		const course = <Course>{
			id: 'course-id',
		}

		http.put = sinon
			.stub()
			.withArgs(path, requestConfig)
			.throws(new Error('Error thrown from test'))

		return expect(restService.put(path, course, accessToken)).to.be.rejectedWith(errorMessage)
	})

	it('should return data from DELETE request', async () => {
		const path = '/courses/course-id'

		http.delete = sinon.stub().withArgs(path, requestConfig)

		const data = await restService.delete(path, accessToken)

		return expect(data).to.be.equal(undefined)
	})

	it('should throw error if problem with DELETE request', async () => {
		const path = '/courses/course-id'
		const errorMessage =
			'Error with DELETE request: Error: Error thrown from test when deleting http://example.org/courses/course-id'

		http.delete = sinon
			.stub()
			.withArgs(path, requestConfig)
			.throws(new Error('Error thrown from test'))

		return expect(restService.delete(path, accessToken)).to.be.rejectedWith(errorMessage)
	})
})
