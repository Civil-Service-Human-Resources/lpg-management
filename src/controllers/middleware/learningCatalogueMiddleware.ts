import {NextFunction, Request, Response, Router} from 'express'
import moment = require('moment')
import {Course} from '../../learning-catalogue/model/course'
import {LearningCatalogue} from '../../learning-catalogue'
import {Audience} from '../../learning-catalogue/model/audience'
import {CsrsService} from '../../csrs/service/csrsService'

export interface LearningCatalogueMiddlewareSettings {
	getModule: boolean,
	audience?: {
		csrsService: CsrsService
	}
}

export function applyLearningCatalogueMiddleware(settings: LearningCatalogueMiddlewareSettings,
												 router: Router, learningCatalogue: LearningCatalogue) {
	let course: Course

	router.param('courseId', async (req: Request, res: Response, next: NextFunction, courseId: string) => {
		course = await learningCatalogue.getCourse(courseId)
		if (course) {
			res.locals.course = course
			next()
		} else {
			res.sendStatus(404)
		}
	})
	if (settings.getModule) {
		router.param('moduleId', async (req: Request, res: Response, next: NextFunction, moduleId: string) => {
			if (course) {
				const module = course.getModule(moduleId)
				if (module) {
					const duration = moment.duration(module.duration, 'seconds')
					res.locals.module = module
					res.locals.module.hours = duration.hours()
					res.locals.module.minutes = duration.minutes()
					next()
				} else {
					res.sendStatus(404)
				}
			} else {
				res.sendStatus(404)
			}
		})
	}
	const audienceSettings = settings.audience
	if (audienceSettings !== undefined) {
		router.param('audienceId', async (req: Request, res: Response, next: NextFunction, audienceId: string) => {
			if (res.locals.course && res.locals.course.audiences) {
				const audience = res.locals.course.audiences.find((audience: Audience) => audience.id == audienceId)
				if (audience) {
					const codeToNameMap  = await audienceSettings.csrsService.getDepartmentCodeToNameMapping()
					res.locals.audience = audience
					res.locals.audienceDepartmentsAsNames = (audience.departments || [])
						.map((d: string) => codeToNameMap[d])
						.sort()
					next()
				}
			}
			if (!res.locals.audience) {
				res.sendStatus(404)
			}
		})
	}
}
