import {LearningCatalogue} from '../learning-catalogue'
import {NextFunction, Request, Response} from 'express'
import {Audience} from '../learning-catalogue/model/audience'
import {Course} from '../learning-catalogue/model/course'

export class AudienceService {
	private readonly learningCatalogue: LearningCatalogue

	constructor(learningCatalogue: LearningCatalogue) {
		this.learningCatalogue = learningCatalogue
	}

	/* istanbul ignore next */
	findAudienceByAudienceIdAndAssignToResponseLocalsOrReturn404() {
		return async (req: Request, res: Response, next: NextFunction, audienceId: string) => {
			const audience = await this.learningCatalogue.getAudience(res.locals.course.id, audienceId)
			if (audience) {
				res.locals.audience = audience
				next()
			} else {
				res.sendStatus(404)
			}
		}
	}

	updateAudience(course: Course, audienceId: string, updateFn: (audience: Audience) => void) {
		if (course && course.audiences && audienceId) {
			const audience = course.audiences.find((audience: Audience) => audience.id == audienceId)
			if (audience) {
				updateFn(audience)
			}
		}
	}

	updateAudienceType(audience: Audience, updatedType: Audience.Type) {
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
}
