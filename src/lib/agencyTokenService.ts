import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
import {EditAgencyToken} from '../controllers/organisationalUnit/model/editAgencyToken'

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

	async renderAgencyTokenPage(organisationalUnit: OrganisationalUnit) {
		const pageModel = new EditAgencyToken(organisationalUnit.id, false, [], 0, 0, this.generateToken())
		if (organisationalUnit.agencyToken) {
			pageModel.tokenExists = true
			pageModel.domain = organisationalUnit.agencyToken.agencyDomains.map(a => a.domain)
			pageModel.spacesInUse = organisationalUnit.agencyToken.capacityUsed
			pageModel.capacity = organisationalUnit.agencyToken.capacity
			pageModel.tokenNumber = organisationalUnit.agencyToken.token
		}
		return pageModel
	}
}
