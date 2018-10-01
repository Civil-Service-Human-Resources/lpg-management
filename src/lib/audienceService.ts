import {LearningCatalogue} from '../learning-catalogue'
import {NextFunction, Request, Response} from 'express'
import {Audience} from '../learning-catalogue/model/audience'
import {JsonpathService} from '../lib/jsonpathService'
import {Course} from '../learning-catalogue/model/course'

export class AudienceService {
	learningCatalogue: LearningCatalogue

	constructor(learningCatalogue: LearningCatalogue) {
		this.learningCatalogue = learningCatalogue
	}

	/* istanbul ignore next */
	findAudienceByAudienceIdAndAssignToResponseLocalsOrReturn404() {
		return async (req: Request, res: Response, next: NextFunction, audienceId: string) => {
			const audience = await this.learningCatalogue.getAudience(res.locals.course.id, audienceId)
			if (audience) {
				res.locals.audience = audience
				res.locals.audienceTypeAsString = Audience.Type[audience.type]
				next()
			} else {
				res.sendStatus(404)
			}
		}
	}

	setDepartmentsOnAudience(course: Course, audienceId: string, departments: any) {
		JsonpathService.jsonpath().value(
			course,
			`$..audiences[?(@.id==${JSON.stringify(audienceId)})].departments`,
			departments
		)
	}

	setAreasOfWorkOnAudience(course: Course, audienceId: string, areasOfWork: string[]) {
		JsonpathService.jsonpath().value(
			course,
			`$..audiences[?(@.id==${JSON.stringify(audienceId)})].areasOfWork`,
			areasOfWork
		)
	}
}
