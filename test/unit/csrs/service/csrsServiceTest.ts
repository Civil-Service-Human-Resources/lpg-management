import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {OauthRestService} from 'lib/http/oauthRestService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('CsrsService tests', () => {
	let csrsService: CsrsService
	let restService: OauthRestService

	beforeEach(() => {
		restService = <OauthRestService>{}
		csrsService = new CsrsService(restService)
	})

	it('should get organisation data', async () => {
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

	it('should get areas of work data', async () => {
		const data = [{id: '123'}]

		restService.get = sinon
			.stub()
			.withArgs('professions')
			.returns(data)

		const result = await csrsService.getAreasOfWork()

		expect(restService.get).to.have.been.calledOnceWith('professions')
		expect(result).to.eql(data)
	})

	it('should get interest data', async () => {
		const data = [
			{
				name: 'Contract management',
			},
		]

		restService.get = sinon
			.stub()
			.withArgs('interests')
			.returns(data)

		const result = await csrsService.getInterests()

		expect(restService.get).to.have.been.calledOnceWith('interests')
		expect(result).to.eql(data)
	})

	describe('#getDepartmentCodeToNameMapping', () => {
		it('should return a map from department code to name', async () => {
			const hmrcName = 'HM Revenue & Customs'
			const dwpName = 'Department for Work & Pensions'

			csrsService.getOrganisations = sinon.stub().returns({
				_embedded: {
					organisations: [{code: 'hmrc', name: hmrcName}, {code: 'dwp', name: dwpName}],
				},
			})
			expect(await csrsService.getDepartmentCodeToNameMapping()).to.be.deep.equal({
				hmrc: hmrcName,
				dwp: dwpName,
			})
		})
	})
})
