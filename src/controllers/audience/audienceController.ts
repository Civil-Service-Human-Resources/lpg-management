import {Request, Response, Router} from 'express'
import {AudienceFactory} from '../../learning-catalogue/model/factory/audienceFactory'
import {LearningCatalogue} from '../../learning-catalogue'
import {Audience} from '../../learning-catalogue/model/audience'
import {Validator} from '../../learning-catalogue/validator/validator'
import {CourseService} from 'lib/courseService'
import {CsrsService} from '../../csrs/service/csrsService'

export class AudienceController {
	learningCatalogue: LearningCatalogue
	audienceValidator: Validator<Audience>
	audienceFactory: AudienceFactory
	courseService: CourseService
	csrsService: CsrsService
	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		audienceValidator: Validator<Audience>,
		audienceFactory: AudienceFactory,
		courseService: CourseService,
		csrsService: CsrsService
	) {
		this.learningCatalogue = learningCatalogue
		this.audienceValidator = audienceValidator
		this.audienceFactory = audienceFactory
		this.courseService = courseService
		this.csrsService = csrsService
		this.router = Router()
		this.configurePathParametersProcessing()
		this.setRouterPaths()
	}

	private configurePathParametersProcessing() {
		this.router.param('courseId', this.courseService.findCourseByCourseIdAndAssignToResponseLocalsOrReturn404())
	}

	private setRouterPaths() {
		this.router.get('/content-management/courses/:courseId/audience/audience', this.getAudienceName())
		this.router.post('/content-management/courses/:courseId/audience/audience', this.setAudienceName())
		this.router.get('/content-management/courses/:courseId/audience/audience-type', this.getAudienceType())
		this.router.post('/content-management/courses/:courseId/audience/audience-type', this.setAudienceType())
		this.router.get(
			'/content-management/courses/:courseId/audience/configure-audience',
			this.getConfigureAudience()
		)
		this.router.get('/content-management/courses/:courseId/audience/add-organisation', this.getOrganisation())
		this.router.post('/content-management/courses/:courseId/audience/add-organisation', this.setOrganisation())
		this.router.get('/content-management/courses/:courseId/audience/add-area-of-work', this.getAreasOfWork())
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
					res.redirect(`/content-management/courses/${req.params.courseId}/audience`)
				})
			} else {
				const savedAudience = await this.learningCatalogue.createAudience(req.params.courseId, audience)
				req.session!.sessionFlash = {audience: savedAudience}
				req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseId}/audience/audience-type`)
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
		return async (request: Request, response: Response) => {
			const courseId = response.locals.course.id

			return response.redirect(`/content-management/courses/${courseId}/audience/configure-audience/`)
		}
	}

	public getConfigureAudience() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/configure-audience')
		}
	}

	public getOrganisation() {
		return async (request: Request, response: Response) => {
			const organisations = await this.csrsService.getOrganisations()
			response.render('page/course/audience/add-organisation', {organisations})
		}
	}

	public setOrganisation() {
		return async (request: Request, response: Response) => {
			response.render('page/course/audience/configure-audience')
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

	// Mick - these should give you the rest of the data you need from csrs
	// You will still need to parse the data to grab the names using the getNameFromNodeData() function on line 103
	// const grades = await this.csrsService.getNode('grades')
	// const jobRoles = await this.csrsService.getNode('jobRoles')
	// const interests = await this.csrsService.getNode('interests')
}
