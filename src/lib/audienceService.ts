import {NextFunction, Request, Response} from 'express'
import {Audience} from '../learning-catalogue/model/audience'

export class AudienceService {
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

	static updateAudienceType(audience: Audience, updatedType: Audience.Type) {
		if (audience.type != updatedType) {
			if (updatedType == Audience.Type.PRIVATE_COURSE) {
				audience.areasOfWork = []
				audience.departments = []
				audience.grades = []
				audience.interests = []
				audience.requiredBy = undefined
				audience.frequency = undefined
			} else {
				audience.eventId = undefined
				if (audience.type == Audience.Type.REQUIRED_LEARNING) {
					audience.requiredBy = undefined
				}
			}
			audience.type = updatedType
		}
	}

	public getDefaults(request: Request) {
		return ''
	}
}
