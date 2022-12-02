import {NextFunction, Request, Response} from 'express'
import {Audience} from '../learning-catalogue/model/audience'
import {CsrsService} from '../csrs/service/csrsService'
// import {Duration} from "moment"

export class AudienceService {
	csrsService: CsrsService

	constructor(csrsService: CsrsService) {
		this.csrsService = csrsService
	}

	/* istanbul ignore next */
	static findAudienceByAudienceIdAndAssignToResponseLocalsOrReturn404() {
		return async (req: Request, res: Response, next: NextFunction, audienceId: string) => {
			if (res.locals.course && res.locals.course.audiences) {
				const audience = res.locals.course.audiences.find((audience: Audience) => audience.id == audienceId)
				if (audience) {
					res.locals.audience = audience
					next()
				}
			}
			if (!res.locals.audience) {
				res.sendStatus(404)
			}
		}
	}

	public getDefaults(request: Request) {
		return ''
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
