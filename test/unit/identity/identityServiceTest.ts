import {AxiosInstance} from 'axios'
import * as sinon from 'sinon'
import {expect} from 'chai'
import {IdentityService} from '../../../src/identity/identityService'
import {Identity} from '../../../src/identity/identity'

describe('IdentityService tests...', function() {
	let identityService: IdentityService
	const http: AxiosInstance = <AxiosInstance>{}

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
					username: 'user',
					roles: ['ROLE1', 'ROLE2'],
				},
			})

		http.get = axiosGet

		const returnValue = identityService.getDetails(token)
		const identity = new Identity('abc123', ['ROLE1', 'ROLE2'], token)

		returnValue.then(function(data) {
			expect(data).to.eql(identity)
		})
	})

	it('getDetailsByEmail() should return Identity when email exists', function() {
		const token: string = 'test-token'
		const emailAddress: string = 'test@test.com'

		const axiosGet = sinon
			.stub()
			.withArgs(`/api/identities/?emailAddress=${emailAddress}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.returns({
				data: {
					uid: 'abc123',
					username: 'user',
					roles: ['ROLE1', 'ROLE2'],
				},
			})

		http.get = axiosGet

		const returnValue = identityService.getDetailsByEmail(emailAddress, token)
		const identity = new Identity('abc123', ['ROLE1', 'ROLE2'], token)

		returnValue.then(function(data) {
			expect(data).to.equal(identity)
		})
	})

	it('getDetailsByEmail() should return null when email does not exist', function() {
		const token: string = 'test-token'
		const emailAddress: string = 'test@test.com'

		const axiosGet = sinon
			.stub()
			.withArgs(`/api/identities/?emailAddress=${emailAddress}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.throws({response: {status: '404'}})

		http.get = axiosGet

		const returnValue = identityService.getDetailsByEmail(emailAddress, token)

		returnValue.then(function(data) {
			expect(data).to.be.null
		})
	})

	it('getDetailsByEmail() should throw error when unauthorised', function() {
		const token: string = 'test-token'
		const emailAddress: string = 'test@test.com'

		const axiosGet = sinon
			.stub()
			.withArgs(`/api/identities/?emailAddress=${emailAddress}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.throws({response: {status: '403'}})

		http.get = axiosGet

		const returnValue = identityService.getDetailsByEmail(emailAddress, token)

		returnValue.then(function(data) {
			expect(data).to.be.rejected
		})
	})
})
