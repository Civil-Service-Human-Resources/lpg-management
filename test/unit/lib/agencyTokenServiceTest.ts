import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {describe} from 'mocha'
import {expect} from 'chai'
import {AgencyTokenService} from '../../../src/lib/agencyTokenService'
import {OrganisationalUnit} from '../../../src/csrs/model/organisationalUnit'
import {AgencyToken} from '../../../src/csrs/model/agencyToken'
import {Domain} from '../../../src/csrs/model/domain'

chai.use(sinonChai)

describe('Agency Token Service', () => {
	let agencyTokenService: AgencyTokenService = new AgencyTokenService()

	describe('#generateToken', () => {
		it('should generate an upper-case alphanumeric string of 10 characters', async () => {
			const token = agencyTokenService.generateToken()

			expect(token).to.match(/^[A-Z0-9]+$/)
			expect(token).to.have.lengthOf(10)
		})
	})

	describe('renderAgencyTokenPage', () => {
		it('should render the agency token page', () => {
			const organisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1
			const result = agencyTokenService.renderAgencyTokenPage(organisationalUnit)
			expect(result.organisationId).to.equal(1)
			expect(result.tokenExists).to.equal(false)
			expect(result.domain.length).to.equal(0)
			expect(result.capacity).to.equal(0)
			expect(result.capacityUsed).to.equal(0)
		})

		it('should render the agency token page from an existing token', () => {
			const agencyToken = new AgencyToken("uid", "token", 10, 5, [
				new Domain(1, "domain.com")
			])
			const organisationalUnit = new OrganisationalUnit()
			organisationalUnit.id = 1
			organisationalUnit.agencyToken = agencyToken
			const result = agencyTokenService.renderAgencyTokenPage(organisationalUnit)
			expect(result.organisationId).to.equal(1)
			expect(result.tokenExists).to.equal(true)
			expect(result.domain[0]).to.equal("domain.com")
			expect(result.capacity).to.equal(10)
			expect(result.capacityUsed).to.equal(5)
		})
	})

})
