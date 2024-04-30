import {AxiosInstance} from 'axios'
import * as sinon from 'sinon'
import {expect} from 'chai'
import {IdentityService} from '../../../src/identity/identityService'
import {Identity} from '../../../src/identity/identity'
import { OrganisationalUnit } from '../../../src/csrs/model/organisationalUnit'
import { CsrsService } from '../../../src/csrs/service/csrsService'
import { OauthRestService } from 'lib/http/oauthRestService'
import { CacheService } from 'lib/cacheService'
import { OrganisationalUnitService } from '../../../src/csrs/service/organisationalUnitService'
import { CivilServant } from '../../../src/csrs/model/civilServant'

describe('IdentityService tests...', function() {
	let identityService: IdentityService
	let csrsService: CsrsService
	const http: AxiosInstance = <AxiosInstance>{}

	beforeEach(function() {
		csrsService = new CsrsService(<OauthRestService>{}, <CacheService>{}, <OrganisationalUnitService>{})
		identityService = new IdentityService(http, csrsService)
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

		let mockCivilServant: CivilServant = new CivilServant()
		let mockOrganisationalUnit = new OrganisationalUnit()
		mockOrganisationalUnit.id = 1
		mockOrganisationalUnit.name = "Org1"
		mockCivilServant.organisationalUnit = mockOrganisationalUnit
		csrsService.getCivilServant = sinon.stub().returns(mockCivilServant)

		const returnValue = identityService.getDetails(token)
		const identity = new Identity('abc123', 'user@domain.com', ['ROLE1', 'ROLE2'], token, mockOrganisationalUnit)

		returnValue.then(function(data) {
			expect(data).to.eql(identity)
		})
	})
})
