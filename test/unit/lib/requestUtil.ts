import {RequestUtil} from '../../../src/lib/requestUtil'
import {expect} from 'chai'
import {mockReq} from 'sinon-express-mock'

describe ('RequestUtil tests', () => {
	it('should parse accessToken from passport user string', () => {
		const accessToken: string = 'abcdefg'
		const requestConfig: object = {
			session: {
				passport: {
					user: `{"uid":"8dc80f78-9a52-4c31-ac54-d280a70c18eb","roles":["COURSE_MANAGER"],"accessToken":"${accessToken}"}`,
				},
			},
		}

		expect(RequestUtil.getAccessToken(mockReq(requestConfig))).to.be.equal(accessToken)
	})
})