import {Request, Response, Router} from 'express'
import {AudienceFactory} from '../../learning-catalogue/model/factory/audienceFactory'
import {LearningCatalogue} from '../../learning-catalogue'
import {Audience} from '../../learning-catalogue/model/audience'
import {Validator} from '../../learning-catalogue/validator/validator'
import {CourseService} from 'lib/courseService'
import {AudienceService} from 'lib/audienceService'
import {CsrsService} from '../../csrs/service/csrsService'

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
		this.router.get('/content-management/courses/:courseId/audiences/audience-name', this.getAudienceName())
		this.router.post('/content-management/courses/:courseId/audiences/audience-name', this.setAudienceName())
		this.router.get('/content-management/courses/:courseId/audiences/audience-type', this.getAudienceType())
		this.router.post('/content-management/courses/:courseId/audiences/audience-type', this.setAudienceType())
		this.router.get(
			'/content-management/courses/:courseId/audience/configure-audience',
			this.getConfigureAudience()
		)
		this.router.get('/content-management/courses/:courseId/audiences/add-organisation', this.getOrganisation())
		this.router.post('/content-management/courses/:courseId/audiences/add-organisation', this.setOrganisation())
		this.router.get('/content-management/courses/:courseId/audiences/add-deadline', this.getDeadline())
		this.router.post('/content-management/courses/:courseId/audiences/add-deadline', this.setDeadline())
		this.router.get('/content-management/courses/:courseId/audiences/add-organisation', this.getOrganisation())
		this.router.post('/content-management/courses/:courseId/audiences/add-organisation', this.setOrganisation())
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/audiences/configure-audience',
			this.getConfigureAudience()
		)
		this.router.get(
			'/content-management/courses/:courseId/audiences/:audienceId/delete',
			this.deleteAudienceConfirmation()
		)
		this.router.post('/content-management/courses/:courseId/audiences/:audienceId/delete', this.deleteAudience())
		this.router.get('/content-management/courses/:courseId/audiences/add-organisation', this.getOrganisation())
		this.router.post('/content-management/courses/:courseId/audiences/add-organisation', this.setOrganisation())
		this.router.get('/content-management/courses/:courseId/audiences/add-area-of-work', this.getAreasOfWork())
		this.router.post('/content-management/courses/:courseId/audiences/add-area-of-work', this.setAreasOfWork())
	}

	public getAudienceName() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/audience-name')
		}
	}

	public setAudienceName() {
		return async (req: Request, res: Response) => {
			const data = {...req.body}
			const errors = await this.audienceValidator.check(data, ['audience.name'])
			const audience = this.audienceFactory.create(data)

			if (errors.size > 0) {
				req.session!.sessionFlash = {errors, audience}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/audience-name`)
				})
			} else {
				const savedAudience = await this.learningCatalogue.createAudience(req.params.courseId, audience)
				req.session!.sessionFlash = {audience: savedAudience}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/audience-type`)
				})
			}
		}
	}

	public getAudienceType() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/audience-type')
		}
	}

	public setAudienceType() {
		return async (req: Request, res: Response) => {
			const data = {...req.body}
			const errors = await this.audienceValidator.check(data, ['audience.type'])
			const audience = this.audienceFactory.create(data)

			if (errors.size > 0) {
				req.session!.sessionFlash = {errors, audienceName: audience.name}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audiences/audience-type`)
				})
			} else {
				const savedAudience = await this.learningCatalogue.createAudience(req.params.courseId, audience)
				req.session!.sessionFlash = {audience: savedAudience}
				req.session!.save(() => {
					res.redirect(
						`/content-management/courses/${req.params.courseId}/audiences/${
							savedAudience.id
						}/audiences/configure-audience`
					)
				})
			}
		}
	}

	public getConfigureAudience() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/configure-audience')
		}
	}

	public getOrganisation() {
		return async (req: Request, res: Response) => {
			const organisations = await this.csrsService.getOrganisations()
			res.render('page/course/audience/add-organisation', {organisations})
		}
	}

	public setOrganisation() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/configure-audience')
		}
	}

	public deleteAudienceConfirmation() {
		return async (req: Request, res: Response) => {
			res.render('page/course/audience/delete-audience-confirmation')
		}
	}

	public deleteAudience() {
		return async (req: Request, res: Response) => {
			await this.learningCatalogue.deleteAudience(req.params.courseId, req.params.audienceId)
			res.redirect(`/content-management/courses/${req.params.courseId}/overview`)
		}
	}

	public getAreasOfWork() {
		return async (request: Request, response: Response) => {
			const areasOfWork = await this.csrsService.getAreasOfWork()

			response.render('page/course/audience/add-area-of-work', {areasOfWork})
		}
	}

	public setAreasOfWork() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/configure-audience')
		}
	}

	public getDeadline() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/add-deadline')
		}
	}

	public setDeadline() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/configure-audience')
		}
	}
}
