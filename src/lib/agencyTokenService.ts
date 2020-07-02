const isValidDomain = require('is-valid-domain')

export class AgencyTokenService {
	generateToken() {
		const length = 10
		const potentialCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let token = ''
		for (let i = length; i > 0; --i) {
			token += potentialCharacters[Math.round(Math.random() * (potentialCharacters.length - 1))]
		}
		return token
	}

	validateDomains(domains: any) {
		if (!(Array.isArray(domains) && domains.length)) {
			return false
		}

		for (const domain of domains) {
			if (!isValidDomain(domain)) {
				return false
			}
		}

		return true
	}

	validateAgencyTokenNumber(agencyTokenNumber: string) {
		const regexForValidCharacters = /^[A-Z0-9]+$/
		return agencyTokenNumber.length == 10 && regexForValidCharacters.test(agencyTokenNumber)
	}
}
