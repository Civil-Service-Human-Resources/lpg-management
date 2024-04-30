import {AxiosInstance} from 'axios'
import {beforeEach, describe, it} from 'mocha'
import * as sinon from 'sinon'
import * as chaiAsPromised from 'chai-as-promised'
import * as chai from 'chai'
import * as url from 'url'

import {expect} from 'chai'
import {LearningCatalogueConfig} from '../../../../src/learning-catalogue/learningCatalogueConfig'
import {Course} from '../../../../src/learning-catalogue/model/course'
import {Auth} from 'src/identity/auth'
import {Identity} from '../../../../src/identity/identity'
import {JsonRestService} from '../../../../src/lib/http/jsonRestService'
import * as sinonChai from 'sinon-chai'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('JsonRestService tests', () => {
	let http: AxiosInstance
	let config = new LearningCatalogueConfig('http://example.org', 60000)
	let auth: Auth
	let restService: JsonRestService

	beforeEach(() => {
		http = <AxiosInstance>{
			defaults: {},
		}
		auth = <Auth>{}
		auth.currentUser = new Identity('user123', 'user@domain.com', [], 'access123')

		restService = new JsonRestService(config, auth)
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
			.withArgs(path)
			.returns(response)

		const data = await restService.get(path)
		return expect(data).to.eql(response.data)
	})

	it('should return data from POST request', async () => {
		const path = '/courses/course-id'

		const course = new Course()

		http.post = sinon
			.stub()
			.withArgs(path, course)
			.returns({
				headers: {
					location: `${config.url}${path}`,
				},
			})

		const getResponse = {
			data: {
				id: 'course-id',
			},
			headers: {
				location: '/test',
			},
		}

		http.get = sinon
			.stub()
			.withArgs(path)
			.returns(getResponse)

		const data = await restService.get(path)

		return expect(data).to.eql(getResponse.data)
		return expect(restService.get(path)).to.be.calledWith(url.parse(`${config.url}${path}`).path!)
	})

	it('should throw error if problem with GET request', async () => {
		const path = '/courses/course-id'
		const errorMessage = 'Error thrown from test'

		http.get = sinon
			.stub()
			.withArgs(path)
			.throws(new Error(errorMessage))

		return expect(restService.get(path)).to.be.rejectedWith(errorMessage)
	})

	it('should throw error if problem with POST request', async () => {
		const path = '/courses/course-id'
		const errorMessage = 'Error with POST request: Error: Error thrown from test when posting {"id":"course-id"} to http://example.org/courses/course-id'
		const course = <Course>{
			id: 'course-id',
		}

		http.post = sinon
			.stub()
			.withArgs(path)
			.throws(new Error(errorMessage))

		return expect(restService.post(path, course)).to.be.rejectedWith(errorMessage)
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
			.withArgs(path, course)
			.returns(getResponse)

		const data = await restService.put(path, course)

		return expect(data).to.eql(getResponse.data)
	})

	it('should throw error if problem with PUT request', async () => {
		const path = '/courses/course-id'
		const errorMessage = 'Error with PUT request: Error: Error thrown from test when putting {"id":"course-id"} to http://example.org/courses/course-id'

		const course = <Course>{
			id: 'course-id',
		}

		http.put = sinon
			.stub()
			.withArgs(path)
			.throws(new Error(errorMessage))

		return expect(restService.put(path, course)).to.be.rejectedWith(errorMessage)
	})

	it('should return data from DELETE request', async () => {
		const path = '/courses/course-id'

		http.delete = sinon.stub().withArgs(path)

		const data = await restService.delete(path)

		return expect(data).to.be.equal(undefined)
	})

	it('should throw error if problem with DELETE request', async () => {
		const path = '/courses/course-id'
		const errorMessage = 'Error with DELETE request: Error: Error thrown from test when deleting http://example.org/courses/course-id'

		http.delete = sinon
			.stub()
			.withArgs(path)
			.throws(new Error(errorMessage))

		return expect(restService.delete(path)).to.be.rejectedWith(errorMessage)
	})

	it('should return data from PATCH request', async () => {
		const path = '/courses/course-id'
		const course = <Course>{
			id: 'course-id',
		}
		const patchResponse = {
			data: {
				id: 'course-id',
			},
		}

		http.patch = sinon
			.stub()
			.withArgs(path)
			.returns(patchResponse)

		const data = await restService.patch(path, course)

		return expect(data).to.be.equal(patchResponse.data)
	})

	it('should throw error if problem with PATCH request', async () => {
		const path = '/courses/course-id'
		const course = <Course>{
			id: 'course-id',
		}
		const errorMessage = 'Error with PATCH request: Error: Error thrown from test when patching http://example.org/courses/course-id'

		http.patch = sinon
			.stub()
			.withArgs(path)
			.throws(new Error(errorMessage))

		return expect(restService.patch(path, course)).to.be.rejectedWith(errorMessage)
	})
})
