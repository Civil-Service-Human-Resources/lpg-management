import {AxiosInstance} from 'axios'
import * as sinon from 'sinon'
import {expect} from 'chai'
import {IdentityService} from '../../../src/identity/identityService'
import {Identity} from '../../../src/identity/identity'
import { OrganisationalUnit } from 'src/csrs/model/organisationalUnit'

describe('IdentityService tests...', function() {
	let identityService: IdentityService
	const http: AxiosInstance = <AxiosInstance>{}
	const organisationalUnit: OrganisationalUnit = <OrganisationalUnit>{}

	beforeEach(function() {
		identityService = new IdentityService(http)
	})

	it('getDetails() should return Identity', function() {
		const token: string = 'test-token'

		const axiosGet = sinon
			.stub()
			.withArgs(`/oauth/resolve`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.returns({
				data: {
					uid: 'abc123',
					"username": "user@domain.com",
					roles: ['ROLE1', 'ROLE2'],
				},
			})

		http.get = axiosGet

		const returnValue = identityService.getDetails(token)
		const identity = new Identity('abc123', 'user@domain.com', ['ROLE1', 'ROLE2'], token, organisationalUnit)

		returnValue.then(function(data) {
			expect(data).to.eql(identity)
		})
	})
})
