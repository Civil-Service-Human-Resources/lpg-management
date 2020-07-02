import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {describe} from 'mocha'
import {expect} from 'chai'
import {AgencyTokenService} from '../../../src/lib/agencyTokenService'

chai.use(sinonChai)

describe('Agency Token Service', () => {
	let agencyTokenService: AgencyTokenService = new AgencyTokenService()

	describe('#generateToken', () => {
		it('should generate an upper-case alphanumeric string of 10 characters', async () => {
			const tokenNumber = agencyTokenService.generateToken()

			expect(tokenNumber).to.match(/^[A-Z0-9]+$/)
			expect(tokenNumber).to.have.lengthOf(10)
		})
	})

	describe('#validateDomains', () => {
		it('should return `true` when a valid domains list is supplied', async () => {
			const domains = ['cabinetoffice.gov.uk', 'nhs.net']
			const domainsIsValid = agencyTokenService.validateDomains(domains)

			expect(domainsIsValid).to.be.true
		})

		it('should return `false` when non-array variable is supplied', async () => {
			const domains = 'a string'
			const domainsIsValid = agencyTokenService.validateDomains(domains)

			expect(domainsIsValid).to.be.false
		})

		it('should return `false` when an empty array is supplied', async () => {
			const domains: any = []
			const domainsIsValid = agencyTokenService.validateDomains(domains)

			expect(domainsIsValid).to.be.false
		})

		it('should return `false` when a domain of invalid format is supplied', async () => {
			const domains = ['thisoneisvalid.com', 'butThisIsAnInvalidDomainFormat']
			const domainsIsValid = agencyTokenService.validateDomains(domains)

			expect(domainsIsValid).to.be.false
		})
	})

	describe('#validateAgencyTokenNumber', () => {
		it('should return `true` when a valid token number is supplied', async () => {
			const tokenNumber = 'ABCDEFG123'
			const tokenNumberIsValid = agencyTokenService.validateAgencyTokenNumber(tokenNumber)

			expect(tokenNumberIsValid).to.be.true
		})

		it('should return `false` when a token number of below minimum length is supplied', async () => {
			const tokenNumber = 'ABCDEFG12'
			const tokenNumberIsValid = agencyTokenService.validateAgencyTokenNumber(tokenNumber)

			expect(tokenNumberIsValid).to.be.false
		})

		it('should return `false` when a token number of above maximum length is supplied', async () => {
			const tokenNumber = 'ABCDEFG1234'
			const tokenNumberIsValid = agencyTokenService.validateAgencyTokenNumber(tokenNumber)

			expect(tokenNumberIsValid).to.be.false
		})

		it('should return `false` when a token number containing a non-alphanumeric character is supplied', async () => {
			const tokenNumber = 'ABCDEFG12*'
			const tokenNumberIsValid = agencyTokenService.validateAgencyTokenNumber(tokenNumber)

			expect(tokenNumberIsValid).to.be.false
		})
	})
})
