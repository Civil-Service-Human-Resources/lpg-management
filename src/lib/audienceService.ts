import {Audience} from '../learning-catalogue/model/audience'
import {CsrsService} from '../csrs/service/csrsService'
// import {Duration} from "moment"

export class AudienceService {
	csrsService: CsrsService

	constructor(csrsService: CsrsService) {
		this.csrsService = csrsService
	}

	async getAudienceName(audience: Audience) {
		let audienceNameComponents: string[] = []
		let sortFunction = (itemOne: string, itemTwo: string) => (itemOne.toLowerCase() > itemTwo.toLowerCase() ? 1 : -1)

		if (Array.isArray(audience.departments) && audience.departments.length) {
			let departmentAbbreviations: string[] = await this.csrsService.getDepartmentAbbreviationsFromCodes(audience.departments)
			let departmentAbbreviationsString = departmentAbbreviations.sort(sortFunction).join(', ')
			audienceNameComponents.push(departmentAbbreviationsString)
		}

		if (Array.isArray(audience.areasOfWork) && audience.areasOfWork.length) {
			let areasOfWorkString = audience.areasOfWork.sort(sortFunction).join(', ')
			audienceNameComponents.push(areasOfWorkString)
		}

		if (Array.isArray(audience.interests) && audience.interests.length) {
			let interestsString = audience.interests.sort(sortFunction).join(', ')
			audienceNameComponents.push(interestsString)
		}

		let audienceName = ''
		if (audienceNameComponents.length) {
			audienceName = audienceNameComponents.join(', ')
		}

		return audienceName
	}
}
