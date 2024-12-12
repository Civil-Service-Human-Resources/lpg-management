import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {OauthRestService} from '../../../../src/lib/http/oauthRestService'
import {CacheService} from '../../../../src/lib/cacheService'
import { OrganisationalUnitService } from '../../../../src/csrs/service/organisationalUnitService'
import { OrganisationalUnitTypeAhead } from '../../../../src/csrs/model/organisationalUnitTypeAhead'
import { OrganisationalUnit } from '../../../../src/csrs/model/organisationalUnit'
import { Domain } from 'src/csrs/model/domain'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('CsrsService tests', () => {
	let csrsService: CsrsService
	let restService: OauthRestService
	let organisationalUnitService: OrganisationalUnitService

	beforeEach(() => {
		restService = <OauthRestService>{}
		organisationalUnitService = <OrganisationalUnitService>{}
		csrsService = new CsrsService(restService, new CacheService(), organisationalUnitService)
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

				expect(restService.get).to.have.been.calledOnceWith('/professions/flat')
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

			expect(restService.get).to.have.been.calledOnceWith('/interests')
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
			const org1 = new OrganisationalUnit()
			org1.code = 'hmrc'
			org1.name = hmrcName
			const org2 = new OrganisationalUnit()
			org2.code = 'dwp'
			org2.name = dwpName
			const expectedNames = [org1, org2]
			const typeahead = new OrganisationalUnitTypeAhead(expectedNames)

			organisationalUnitService.getOrgDropdown = sinon.stub().returns(typeahead)

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

	describe('#getDepartmentAbbreviationsFromCodes', () => {
		it('should return a map from department code to abbreviation', async () => {
			const hmrcAbbreviation = 'HMRC'
			const dwpAbbreviation = 'DWP'
			const org1 = new OrganisationalUnit()
			org1.code = 'hmrc'
			org1.abbreviation = hmrcAbbreviation
			const org2 = new OrganisationalUnit()
			org2.code = 'dwp'
			org2.abbreviation = dwpAbbreviation
			const expectedCodes = [org1, org2]
			const typeahead = new OrganisationalUnitTypeAhead(expectedCodes)
			organisationalUnitService.getOrgDropdown = sinon.stub().resolves(typeahead)
			expect(await csrsService.getDepartmentAbbreviationsFromCodes(['hmrc', 'dwp'])).to.be.deep.equal([hmrcAbbreviation, dwpAbbreviation])
		})
	})

	describe("#getOrganisationalUnitsForUser", () => {
		it("should return a filtered list of organisations according to the user's domain if user is not a super reporter", async () => {

			let mockUser = {
				isSuperReporter: () => {
					return false
				},
				isSuperUser: () => {
					return false
				},
				isUnrestrictedOrganisation: () => {
					return false
				},
				getDomain: () => {
					return "user-domain.gov.uk"
				},
				username: "user@user-domain.gov.uk"
			}

			let userDomain = new Domain(1, "user-domain.gov.uk")
			let notUserDomain = new Domain(2, "not-user-domain.gov.uk")

			let organisation1 = new OrganisationalUnit()
			organisation1.id = 1
			organisation1.domains = [userDomain]

			let organisation2 = new OrganisationalUnit()
			organisation2.id = 2
			organisation2.domains = [notUserDomain]

			let organisation3 = new OrganisationalUnit()
			organisation3.id = 3
			organisation3.domains = [userDomain, notUserDomain]

			let listOrganisationalUnitsForTypehead = sinon
				.stub()
				.returns({
					typeahead: [organisation1, organisation2, organisation3]
				})

			csrsService.listOrganisationalUnitsForTypehead = listOrganisationalUnitsForTypehead

			let actualResult = await csrsService.getOrganisationalUnitsForUser(mockUser)

			expect(actualResult.length).to.equal(2)
			expect(actualResult[0].id).to.equal(1)
			expect(actualResult[1].id).to.equal(3)

		})

		it("should return all organisations if user is a super reporter", async () => {

			let mockUser = {
				isSuperReporter: () => {
					return true
				},
				isSuperUser: () => {
					return false
				},
				isUnrestrictedOrganisation: () => {
					return false
				},
				username: "user@user-domain.gov.uk"
			}

			let userDomain = new Domain(1, "user-domain.gov.uk")
			let notUserDomain = new Domain(2, "not-user-domain.gov.uk")

			let organisation1 = new OrganisationalUnit()
			organisation1.id = 1
			organisation1.domains = [userDomain]

			let organisation2 = new OrganisationalUnit()
			organisation2.id = 2
			organisation2.domains = [notUserDomain]

			let organisation3 = new OrganisationalUnit()
			organisation3.id = 3
			organisation3.domains = [userDomain, notUserDomain]

			let listOrganisationalUnitsForTypehead = sinon
				.stub()
				.returns({
					typeahead: [organisation1, organisation2, organisation3]
				})

			csrsService.listOrganisationalUnitsForTypehead = listOrganisationalUnitsForTypehead

			let actualResult = await csrsService.getOrganisationalUnitsForUser(mockUser)

			expect(actualResult.length).to.equal(3)
			expect(actualResult[0].id).to.equal(1)
			expect(actualResult[1].id).to.equal(2)
			expect(actualResult[2].id).to.equal(3)

		})

		it("userCanAccessAllOrganisations() should return false if all checks are false", () => {
			let mockUser = {
				isSuperReporter: () => {
					return false
				},
				isSuperUser: () => {
					return false
				},
				isUnrestrictedOrganisation: () => {
					return false
				}

			}

			let expectedResult = false
			let actualResult = csrsService.userCanAccessAllOrganisations(mockUser)

			expect(actualResult).to.equal(expectedResult)
		})

		it("userCanAccessAllOrganisations() should return true if only isUnrestrictedOrganisation() is true", () => {
			let mockUser = {
				isSuperReporter: () => {
					return false
				},
				isSuperUser: () => {
					return false
				},
				isUnrestrictedOrganisation: () => {
					return true
				}

			}

			let expectedResult = true
			let actualResult = csrsService.userCanAccessAllOrganisations(mockUser)

			expect(actualResult).to.equal(expectedResult)
		})

		it("userCanAccessAllOrganisations() should return true if user is super reporter, super user and unrestricted organisation", () => {
			let mockUser = {
				isSuperReporter: () => {
					return true
				},
				isSuperUser: () => {
					return true
				},
				isUnrestrictedOrganisation: () => {
					return true
				}

			}

			let expectedResult = true
			let actualResult = csrsService.userCanAccessAllOrganisations(mockUser)

			expect(actualResult).to.equal(expectedResult)
		})
	})


})
