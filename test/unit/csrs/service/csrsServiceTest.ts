import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {OauthRestService} from '../../../../src/lib/http/oauthRestService'
import {CacheService} from '../../../../src/lib/cacheService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('CsrsService tests', () => {
	let csrsService: CsrsService
	let restService: OauthRestService

	beforeEach(() => {
		restService = <OauthRestService>{}
		csrsService = new CsrsService(restService, new CacheService())
	})

	describe('#getOrganisations', () => {
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

			restService.get = sinon.stub()
				.returns(data)

			const result = await csrsService.getOrganisations()

			expect(restService.get).to.have.been.calledOnceWith('organisationalUnits')
			expect(result).to.eql(data)
		})
	})

	describe('areas of work', () => {
		const areasOfWork = {
			_embedded: {professions: [{name: 'Analysis'}, {name: 'Commercial'}, {name: 'Corporate finance'}]},
		}

		beforeEach(() => {
			restService.get = sinon
				.stub()
				.withArgs('professions')
				.returns(areasOfWork)
		})

		describe('#getAreasOfWork', () => {
			it('should get areas of work data', async () => {
				const result = await csrsService.getAreasOfWork()

				expect(restService.get).to.have.been.calledOnceWith('professions')
				expect(result).to.eql(areasOfWork)
			})
		})

		describe('#isAreaOfWorkValid', () => {
			it('should return true if area of work is found in areas of work list', async () => {
				expect(await csrsService.isAreaOfWorkValid('Analysis')).to.be.true
			})

			it('should return false if area of work is not found in areas of work list', async () => {
				expect(await csrsService.isAreaOfWorkValid('not a valid area of work')).to.be.false
			})
		})
	})

	describe('#getInterests', () => {
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

			const result = await csrsService.getCoreLearning()

			expect(restService.get).to.have.been.calledOnceWith('interests')
			expect(result).to.eql(data)
		})
	})

	describe('grades', () => {
		const grades = {
			_embedded: {
				grades: [{code: 'AA', name: 'Administrative Assistant'}, {code: 'EO', name: 'Executive Officer'}],
			},
		}

		beforeEach(() => {
			restService.get = sinon
				.stub()
				.withArgs('grades')
				.returns(grades)
		})

		describe('#getGrades', () => {
			it('should return grades names and codes', async () => {
				expect(await csrsService.getGrades()).to.be.equal(grades)
			})
		})

		describe('#isGradeCodeValid', () => {
			it('should return true if grade code is found in grades list', async () => {
				expect(await csrsService.isGradeCodeValid('AA')).to.be.true
			})

			it('should return false if grade code is not found in grades list', async () => {
				expect(await csrsService.isGradeCodeValid('not a valid grade code')).to.be.false
			})
		})
	})

	describe('#getDepartmentCodeToNameMapping', () => {
		it('should return a map from department code to name', async () => {
			const hmrcName = 'HM Revenue & Customs'
			const dwpName = 'Department for Work & Pensions'

			csrsService.getOrganisations = sinon.stub().returns({
				_embedded: {
					organisationalUnits: [{code: 'hmrc', name: hmrcName}, {code: 'dwp', name: dwpName}],
				},
			})
			expect(await csrsService.getDepartmentCodeToNameMapping()).to.be.deep.equal({
				hmrc: hmrcName,
				dwp: dwpName,
			})
		})
	})

	describe('#getGradeCodeToNameMapping', () => {
		it('should return a map from grade code to name', async () => {
			const admAsstName = 'Administrative Assistant'
			const eoName = 'Executive Officer'

			csrsService.getGrades = sinon.stub().returns({
				_embedded: {
					grades: [{code: 'AA', name: admAsstName}, {code: 'EO', name: eoName}],
				},
			})
			expect(await csrsService.getGradeCodeToNameMapping()).to.be.deep.equal({
				AA: admAsstName,
				EO: eoName,
			})
		})
	})
})
