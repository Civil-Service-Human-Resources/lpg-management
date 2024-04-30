import {AxiosInstance} from 'axios'
import {beforeEach, describe, it} from 'mocha'
import * as sinon from 'sinon'
import * as chaiAsPromised from 'chai-as-promised'
import * as chai from 'chai'

import {expect} from 'chai'
import {LearningCatalogueConfig} from '../../../../src/learning-catalogue/learningCatalogueConfig'
import {Auth} from 'src/identity/auth'
import {Identity} from '../../../../src/identity/identity'
import {OauthRestService} from '../../../../src/lib/http/oauthRestService'
import * as sinonChai from 'sinon-chai'
import { OrganisationalUnit } from 'src/csrs/model/organisationalUnit'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('OAuthRestService tests', () => {
	let http: AxiosInstance
	let config = new LearningCatalogueConfig('http://example.org', 60000)
	let auth: Auth
	let restService: OauthRestService
	let headers: {}
	beforeEach(() => {
		http = <AxiosInstance>{
			defaults: {},
		}
		auth = <Auth>{}
		auth.currentUser = new Identity('user123', 'user@domain.com', [], 'access123', new OrganisationalUnit())

		restService = new OauthRestService(config, auth)
		restService.http = http

		headers = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${auth.currentUser.accessToken}`,
			},
		}
	})

	it('should return data from oauth GET request', async () => {
		const path = '/courses/course-id'

		const response = {
			data: {
				id: 'course-id',
			},
		}

		http.get = sinon.stub().returns(response)

		const data = await restService.get(path)
		expect(data).to.eql(response.data)
		expect(http.get).to.be.calledWith(path, headers)
	})
})
