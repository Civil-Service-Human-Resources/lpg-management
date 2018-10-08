import {LearningCatalogue} from '../learning-catalogue'
import {NextFunction, Request, Response} from 'express'
import {Audience} from '../learning-catalogue/model/audience'
import {JsonpathService} from '../lib/jsonpathService'
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
				res.locals.audienceTypeAsString = Audience.Type[audience.type]
				next()
			} else {
				res.sendStatus(404)
			}
		}
	}

	setDepartmentsOnAudience(course: Course, audienceId: string, departments: string[]) {
		JsonpathService.setValue(
			course,
			`$..audiences[?(@.id==${JSON.stringify(audienceId)})].departments`,
			departments
		)
	}

	setAreasOfWorkOnAudience(course: Course, audienceId: string, areasOfWork: string[]) {
		JsonpathService.setValue(
			course,
			`$..audiences[?(@.id==${JSON.stringify(audienceId)})].areasOfWork`,
			areasOfWork
		)
	}

	setGradesOnAudience(course: Course, audienceId: string, grades: string[]) {
		JsonpathService.setValue(course, `$..audiences[?(@.id==${JSON.stringify(audienceId)})].grades`, grades)
	}

	setCoreLearningOnAudience(course: Course, audienceId: string, interests: string[]) {
		JsonpathService.setValue(course, `$..audiences[?(@.id==${JSON.stringify(audienceId)})].interests`, interests)
	}

	setDeadlineOnAudience(course: Course, audienceId: string, deadline: Date | null) {
		JsonpathService.setValue(course, `$..audiences[?(@.id==${JSON.stringify(audienceId)})].requiredBy`, deadline)
	}
}
