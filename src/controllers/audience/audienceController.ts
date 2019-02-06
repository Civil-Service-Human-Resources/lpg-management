import {Request, Response, Router} from 'express'
import {AudienceFactory} from '../../learning-catalogue/model/factory/audienceFactory'
import {LearningCatalogue} from '../../learning-catalogue'
import {Audience} from '../../learning-catalogue/model/audience'
import {Event} from '../../learning-catalogue/model/event'
import {Validator} from '../../learning-catalogue/validator/validator'
import {CourseService} from '../../lib/courseService'
import {AudienceService} from '../../lib/audienceService'
import {CsrsService} from '../../csrs/service/csrsService'
import {DateTime} from '../../lib/dateTime'
import {Csrs} from '../../csrs'

export class AudienceController {
	learningCatalogue: LearningCatalogue
	audienceValidator: Validator<Audience>
	audienceFactory: AudienceFactory
	courseService: CourseService
	csrsService: CsrsService
	csrs: Csrs
	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		audienceValidator: Validator<Audience>,
		audienceFactory: AudienceFactory,
		courseService: CourseService,
		csrsService: CsrsService,
		csrs: Csrs
	) {
		this.learningCatalogue = learningCatalogue
		this.audienceValidator = audienceValidator
		this.audienceFactory = audienceFactory
		this.courseService = courseService
		this.csrsService = csrsService
		this.csrs = csrs
		this.router = Router()
		this.configurePathParametersProcessing()
		this.setRouterPaths()
	}

	private configurePathParametersProcessing() {
		this.router.param('courseId', this.courseService.findCourseByCourseIdAndAssignToResponseLocalsOrReturn404())
		this.router.param('audienceId', AudienceService.findAudienceByAudienceIdAndAssignToResponseLocalsOrReturn404())
	}

	private setRouterPaths() {
		this.router.get('/content-management/courses/:courseId/audiences/', this.getAudienceName())
		this.router.post('/content-management/courses/:courseId/audiences/', this.setAudienceName())
		this.router.get('/content-management/courses/:courseId/audiences/type', this.getAudienceType())
		this.router.post('/content-management/courses/:courseId/audiences/type', this.setAudienceType())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/type', this.getAudienceType())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/type', this.setAudienceType())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/configure', this.getConfigureAudience())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/organisation', this.getOrganisation())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/organisation', this.setOrganisation())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/organisation/delete', this.deleteOrganisation())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/deadline', this.getDeadline())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/deadline', this.setDeadline())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/deadline/delete', this.deleteDeadline())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/delete', this.deleteAudienceConfirmation())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/delete', this.deleteAudience())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/area-of-work', this.getAreasOfWork())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/area-of-work', this.setAreasOfWork())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/area-of-work/delete', this.deleteAreasOfWork())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/add-core-learning', this.getCoreLearning())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/add-core-learning', this.setCoreLearning())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/core-learning/delete', this.deleteCoreLearning())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/grades', this.getGrades())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/grades', this.setGrades())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/grades/delete', this.deleteGrades())
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/event', this.getPrivateCourseEvent())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/event', this.setPrivateCourseEvent())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/event/delete', this.deletePrivateCourseEvent())
	}

	getAudienceName() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/audience-name')
		}
	}

	setAudienceName() {
		return async (req: Request, res: Response) => {
			const data = {...req.body}
			const errors = await this.audienceValidator.check(data, ['audience.name'])
			const audience = this.audienceFactory.create(data)

			if (errors.size > 0) {
				req.session!.sessionFlash = {errors, audience}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/`)
				})
			} else {
				req.session!.sessionFlash = {audienceName: audience.name}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/type`)
				})
			}
		}
	}

	getAudienceType() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/audience-type', {AudienceType: Audience.Type})
		}
	}

	setAudienceType() {
		return async (req: Request, res: Response) => {
			const data = {...req.body}
			const errors = await this.audienceValidator.check(data, ['audience.type'])
			const audienceFromData = this.audienceFactory.create(data)

			if (errors.size > 0) {
				req.session!.sessionFlash = {errors, audienceName: audienceFromData.name}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/type`)
				})
			} else {
				let savedAudienceId: string
				if (res.locals.audience) {
					AudienceService.updateAudienceType(res.locals.audience, audienceFromData.type)
					await this.learningCatalogue.updateCourse(res.locals.course)
					savedAudienceId = req.params.audienceId
				} else {
					savedAudienceId = (await this.learningCatalogue.createAudience(req.params.courseId, audienceFromData)).id
				}
				res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${savedAudienceId}/configure`)
			}
		}
	}

	getConfigureAudience() {
		return async (req: Request, res: Response) => {
			const departmentCodeToName = await this.csrsService.getDepartmentCodeToNameMapping()
			const gradeCodeToName = await this.csrsService.getGradeCodeToNameMapping()
			const audienceIdToEvent = this.courseService.getAudienceIdToEventMapping(res.locals.course)
			res.render('page/course/audience/configure-audience', {
				AudienceType: Audience.Type,
				departmentCodeToName,
				gradeCodeToName,
				audienceIdToEvent,
			})
		}
	}

	getOrganisation() {
		return async (req: Request, res: Response) => {
			const organisations = await this.csrs.listOrganisationalUnitsForTypehead()
			res.render('page/course/audience/add-organisation', {organisationalUnits: organisations})
		}
	}

	setOrganisation() {
		return async (req: Request, res: Response) => {
			const departments = req.body.organisation === 'all' ? await this.getAllOrganisationCodes() : [req.body['parent']]

			res.locals.audience.departments = departments

			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	deleteOrganisation() {
		return async (req: Request, res: Response) => {
			res.locals.audience.departments = []
			await this.learningCatalogue.updateCourse(res.locals.course)
			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	private async getAllOrganisationCodes(): Promise<string[]> {
		const organisations = await this.csrsService.getOrganisations()
		return organisations._embedded.organisationalUnits.map((org: any) => {
			return org.code
		})
	}

	deleteAudienceConfirmation() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/delete-audience-confirmation')
		}
	}

	deleteAudience() {
		return async (req: Request, res: Response) => {
			await this.learningCatalogue.deleteAudience(req.params.courseId, req.params.audienceId)
			res.redirect(`/content-management/courses/${req.params.courseId}/overview`)
		}
	}

	getAreasOfWork() {
		return async (req: Request, res: Response) => {
			const areasOfWork = await this.csrsService.getAreasOfWorkForTypeAhead()
			res.render('page/course/audience/add-area-of-work', {areasOfWork})
		}
	}

	setAreasOfWork() {
		return async (req: Request, res: Response) => {
			const areaOfWork = req.body['area-of-work']
			if (areaOfWork) {
				if (await this.csrsService.isAreaOfWorkValid(areaOfWork)) {
					res.locals.audience.areasOfWork = [areaOfWork]
					await this.learningCatalogue.updateCourse(res.locals.course)
				}
			}

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	deleteAreasOfWork() {
		return async (req: Request, res: Response) => {
			res.locals.audience.areasOfWork = []
			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	getDeadline() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/add-deadline', {exampleYear: new Date(Date.now()).getFullYear() + 1})
		}
	}

	setDeadline() {
		return async (req: Request, res: Response) => {
			const year = req.body['deadline-year'] || ''
			const month = req.body['deadline-month'] || ''
			const day = req.body['deadline-day'] || ''

			const date = DateTime.yearMonthDayToDate(year, month, day)
			const errors = await this.audienceValidator.check({requiredBy: date.toDate()}, ['audience.requiredBy'])

			if (!errors.size) {
				res.locals.audience.requiredBy = date.toDate()
				await this.learningCatalogue.updateCourse(res.locals.course)
				res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
			} else {
				req.session!.sessionFlash = {errors, deadlineDate: {year, month, day}}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/deadline`)
				})
			}
		}
	}

	deleteDeadline() {
		return async (req: Request, res: Response) => {
			res.locals.audience.requiredBy = undefined
			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	getGrades() {
		return async (req: Request, res: Response) => {
			const grades = await this.csrsService.getGrades()
			res.render('page/course/audience/add-grades', {grades})
		}
	}

	setGrades() {
		return async (req: Request, res: Response) => {
			const gradeCodes = Array.isArray(req.body.grades) ? req.body.grades : [req.body.grades]
			if (gradeCodes && gradeCodes.length > 0) {
				const allGradesValid = await gradeCodes.reduce(
					async (allValid: boolean, gradeCode: string) => (allValid ? await this.csrsService.isGradeCodeValid(gradeCode) : false),
					true
				)
				if (allGradesValid) {
					res.locals.audience.grades = gradeCodes
					await this.learningCatalogue.updateCourse(res.locals.course)
				}
			}

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	deleteGrades() {
		return async (req: Request, res: Response) => {
			res.locals.audience.grades = []
			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	getCoreLearning() {
		return async (request: Request, response: Response) => {
			const interests = await this.csrsService.getCoreLearning()
			response.render('page/course/audience/add-core-learning', {interests})
		}
	}

	setCoreLearning() {
		return async (req: Request, res: Response) => {
			const interests = Array.isArray(req.body.interests) ? req.body.interests : [req.body.interests]
			if (interests) {
				const allInterestsValid = await interests.reduce(
					async (allValid: boolean, interest: string) => (allValid ? await this.csrsService.isCoreLearningValid(interest) : false),
					true
				)
				if (allInterestsValid) {
					res.locals.audience.interests = interests
					await this.learningCatalogue.updateCourse(res.locals.course)
				}
			}
			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	deleteCoreLearning() {
		return async (req: Request, res: Response) => {
			res.locals.audience.interests = []
			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	getPrivateCourseEvent() {
		return async (req: Request, res: Response) => {
			const courseEvents = this.courseService.getAllEventsOnCourse(res.locals.course).map((event: Event) => {
				event.dateRanges.sort((dr1, dr2) => (dr1.date < dr2.date ? -1 : dr1.date > dr2.date ? 1 : 0))
				return event
			})
			res.render('page/course/audience/add-event', {courseEvents})
		}
	}

	setPrivateCourseEvent() {
		return async (req: Request, res: Response) => {
			const eventId = req.body.events
			if (eventId) {
				const event = this.courseService.getAllEventsOnCourse(res.locals.course).find((event: Event) => event.id == eventId)
				if (event) {
					res.locals.audience.eventId = eventId
					await this.learningCatalogue.updateCourse(res.locals.course)
				}
			}
			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}

	deletePrivateCourseEvent() {
		return async (req: Request, res: Response) => {
			res.locals.audience.eventId = undefined
			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`)
		}
	}
}
