import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {CsrsService} from '../../../../src/csrs/service/csrsService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('CsrsService tests', () => {
	let restService: RestService
	let csrsService: CsrsService

	beforeEach(() => {
		restService = <RestService>{}
		csrsService = new CsrsService(restService)
	})

	it('should get organisations data', async () => {
		const data = [
			{
				code: 'co',
				name: 'Cabinet Office',
			},
			{
				code: 'dh',
				name: 'Department of Health & Social Care',
			},
		]

		restService.get = sinon
			.stub()
			.withArgs('organisations')
			.returns(data)

		const result = await csrsService.getOrganisations()

		expect(restService.get).to.have.been.calledOnceWith('organisations')
		expect(result).to.eql(data)
	})
})
