import {Request, Response, Router} from 'express'
import {AudienceFactory} from '../../learning-catalogue/model/factory/audienceFactory'
import {LearningCatalogue} from '../../learning-catalogue'
import {Audience} from '../../learning-catalogue/model/audience'
import {Validator} from '../../learning-catalogue/validator/validator'
import {CourseService} from '../../lib/courseService'
import {AudienceService} from '../../lib/audienceService'
import {CsrsService} from '../../csrs/service/csrsService'
import {JsonpathService} from '../../lib/jsonpathService'

export class AudienceController {
	learningCatalogue: LearningCatalogue
	audienceValidator: Validator<Audience>
	audienceFactory: AudienceFactory
	courseService: CourseService
	audienceService: AudienceService
	csrsService: CsrsService
	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		audienceValidator: Validator<Audience>,
		audienceFactory: AudienceFactory,
		courseService: CourseService,
		audienceService: AudienceService,
		csrsService: CsrsService
	) {
		this.learningCatalogue = learningCatalogue
		this.audienceValidator = audienceValidator
		this.audienceFactory = audienceFactory
		this.courseService = courseService
		this.audienceService = audienceService
		this.csrsService = csrsService
		this.router = Router()
		this.configurePathParametersProcessing()
		this.setRouterPaths()
	}

	private configurePathParametersProcessing() {
		this.router.param('courseId', this.courseService.findCourseByCourseIdAndAssignToResponseLocalsOrReturn404())
		this.router.param(
			'audienceId',
			this.audienceService.findAudienceByAudienceIdAndAssignToResponseLocalsOrReturn404()
		)
	}

	private setRouterPaths() {
		this.router.get('/content-management/courses/:courseId/audiences/', this.getAudienceName())
		this.router.post('/content-management/courses/:courseId/audiences/', this.setAudienceName())
		this.router.get('/content-management/courses/:courseId/audiences/type', this.getAudienceType())
		this.router.post('/content-management/courses/:courseId/audiences/type', this.setAudienceType())
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/configure-audience',
			this.getConfigureAudience()
		)
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/organisation',
			this.getOrganisation()
		)
		this.router.post(
			'/content-management/courses/:courseId/audiences/:audienceId/organisation',
			this.setOrganisation()
		)
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/organisation/delete',
			this.deleteOrganisation()
		)
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/deadline', this.getDeadline())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/deadline', this.setDeadline())
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/delete',
			this.deleteAudienceConfirmation()
		)
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/delete', this.deleteAudience())
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/area-of-work',
			this.getAreasOfWork()
		)
		this.router.post(
			'/content-management/courses/:courseId/audiences/:audienceId/area-of-work',
			this.setAreasOfWork()
		)
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/area-of-work/delete',
			this.deleteAreasOfWork()
		)
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/add-core-learning',
			this.getCoreLearning()
		)
		this.router.post(
			'/content-management/courses/:courseId/audiences/:audienceId/add-core-learning',
			this.setCoreLearning()
		)
		this.router.post(
			'/content-management/courses/:courseId/audiences/:audienceId/core-learning/delete',
			this.deleteCoreLearning()
		)
		this.router.get('/content-management/courses/:courseId/audiences/:audienceId/grades', this.getGrades())
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/grades', this.setGrades())
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
			res.render('page/course/audience/audience-type')
		}
	}

	setAudienceType() {
		return async (req: Request, res: Response) => {
			const data = {...req.body}
			const errors = await this.audienceValidator.check(data, ['audience.type'])
			const audience = this.audienceFactory.create(data)

			if (errors.size > 0) {
				req.session!.sessionFlash = {errors, audienceName: audience.name}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/type`)
				})
			} else {
				const savedAudience = await this.learningCatalogue.createAudience(req.params.courseId, audience)
				req.session!.sessionFlash = {audience: savedAudience}
				req.session!.save(() => {
					res.redirect(
						// prettier-ignore
						`/content-management/courses/${req.params.courseId}/audiences/${savedAudience.id}/configure-audience`
					)
				})
			}
		}
	}

	getConfigureAudience() {
		return async (req: Request, res: Response) => {
			const departmentCodeToName = await this.csrsService.getDepartmentCodeToNameMapping()
			res.render('page/course/audience/configure-audience', {departmentCodeToName})
		}
	}

	getOrganisation() {
		return async (req: Request, res: Response) => {
			const organisations = await this.csrsService.getOrganisations()
			res.render('page/course/audience/add-organisation', {organisations})
		}
	}

	setOrganisation() {
		return async (req: Request, res: Response) => {
			const organisations = await this.csrsService.getOrganisations()
			const selectedOrganisations = this.mapSelectedOrganisationToCodes(
				req.body.organisation,
				req.body['input-autocomplete'],
				organisations
			)
			if (selectedOrganisations.length > 0) {
				this.audienceService.setDepartmentsOnAudience(
					res.locals.course,
					req.params.audienceId,
					selectedOrganisations
				)
				await this.learningCatalogue.updateCourse(res.locals.course)
			}
			res.redirect(
				`/content-management/courses/${req.params.courseId}/audiences/${
					req.params.audienceId
				}/configure-audience`
			)
		}
	}

	deleteOrganisation() {
		return async (req: Request, res: Response) => {
			JsonpathService.jsonpath().value(
				res.locals.course,
				`$..audiences[?(@.id=='${req.params.audienceId}')].departments`,
				[]
			)
			await this.learningCatalogue.updateCourse(res.locals.course)
			res.redirect(
				`/content-management/courses/${req.params.courseId}/audiences/${
					req.params.audienceId
				}/configure-audience`
			)
		}
	}

	deleteOrganisation() {
		return async (req: Request, res: Response) => {
			this.audienceService.setDepartmentsOnAudience(res.locals.course, req.params.audienceId, [])
			await this.learningCatalogue.updateCourse(res.locals.course)
			res.redirect(
				`/content-management/courses/${req.params.courseId}/audiences/${req.params.audienceId}/configure`
			)
		}
	}

	private mapSelectedOrganisationToCodes(
		organisation: string,
		organisationName: string,
		organisations: any
	): string[] {
		return organisations._embedded.organisations
			.filter((org: any) => {
				return organisation === 'all' || org.name === organisationName
			})
			.map((org: any) => {
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
			const areasOfWork = await this.csrsService.getAreasOfWork()
			res.render('page/course/audience/add-area-of-work', {areasOfWork})
		}
	}

	setAreasOfWork() {
		return async (req: Request, res: Response) => {
			const areaOfWork = req.body['area-of-work']
			if (areaOfWork) {
				if (await this.csrsService.isAreaOfWorkValid(areaOfWork)) {
					this.audienceService.setAreasOfWorkOnAudience(res.locals.course, req.params.audienceId, [
						areaOfWork,
					])
					await this.learningCatalogue.updateCourse(res.locals.course)
				}
			}

			res.redirect(
				`/content-management/courses/${req.params.courseId}/audiences/${
					req.params.audienceId
				}/configure-audience`
			)
		}
	}

	deleteAreasOfWork() {
		return async (req: Request, res: Response) => {
			JsonpathService.jsonpath().value(
				res.locals.course,
				`$..audiences[?(@.id=='${req.params.audienceId}')].areasOfWork`,
				[]
			)
			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(
				`/content-management/courses/${req.params.courseId}/audiences/${
					req.params.audienceId
				}/configure-audience`
			)
		}
	}

	getDeadline() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/add-deadline')
		}
	}

	setDeadline() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/configure-audience')
		}
	}
	getGrades() {
		return async (request: Request, response: Response) => {
			const grades = await this.csrsService.getGrades()

			response.render('page/course/audience/add-grades', {grades})
		}
	}

	setGrades() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/configure-audience')
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
					async (allValid: boolean, interest: string) =>
						allValid ? await this.csrsService.isCoreLearningValid(interest) : false,
					true
				)
				if (allInterestsValid) {
					this.audienceService.setCoreLearningOnAudience(res.locals.course, req.params.audienceId, interests)
					await this.learningCatalogue.updateCourse(res.locals.course)
				}
			}
			res.redirect(
				`/content-management/courses/${req.params.courseId}/audiences/1-jqY1EBT2WGYPIO4gyjYw/configure-audience`
			)
		}
	}

	deleteCoreLearning() {
		return async (req: Request, res: Response) => {
			JsonpathService.jsonpath().value(
				res.locals.course,
				`$..audiences[?(@.id=='${req.params.audienceId}')].interests`,
				[]
			)
			await this.learningCatalogue.updateCourse(res.locals.course)

			res.redirect(
				`/content-management/courses/${req.params.courseId}/audiences/${
					req.params.audienceId
				}/configure-audience`
			)
		}
	}
}
