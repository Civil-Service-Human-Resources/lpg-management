import { Request, Response, Router } from 'express'
import { ReportService } from '../report-service'
import { CsrsService } from 'src/csrs/service/csrsService'
import { OrganisationalUnitService } from 'src/csrs/service/organisationalUnitService'
import { fetchCourseCompletionSessionObject, saveCourseCompletionSessionObject } from './reporting/utils'
import { ChooseOrganisationsModel } from './reporting/model/chooseOrganisationsModel'
import { SubmitOrganisationsModel } from './reporting/model/submitOrganisationsModel'
import { validate } from 'class-validator'
import { FormattedOrganisation } from 'src/csl-service/model/FormattedOrganisation'
import { CslService } from 'src/csl-service/service/cslService'

const { xss } = require('express-xss-sanitizer')


export class ReportingController {
	router: Router
	reportService: ReportService
	csrsService: CsrsService
	cslService: CslService
	organisationalUnitService: OrganisationalUnitService

	constructor(
		reportService: ReportService,
		csrsService: CsrsService,
		organisationalUnitService: OrganisationalUnitService,
		cslService: CslService
	) {
		this.router = Router()
		this.configureRouterPaths()
		this.reportService = reportService
		this.csrsService = csrsService
		this.organisationalUnitService = organisationalUnitService
		this.cslService = cslService
	}

	private configureRouterPaths() {
		this.router.get('/reporting/course-completions/choose-organisation', xss(), this.getChooseOrganisationPage())
		this.router.post('/reporting/course-completions/choose-organisation', xss(), this.submitOrganisationSelection())
	}

	getChooseOrganisationPage() {
		return async (request: Request, response: Response) => {
			let currentUser = request.user

			if (currentUser && currentUser.isOrganisationReporter() && currentUser.isMVPReporter()) {
				const formattedOtherOrganisations: FormattedOrganisation[] = await this.cslService.getOrganisationTypeaheadForUser(currentUser)

				const pageModel = new ChooseOrganisationsModel({
					name: currentUser.organisationalUnit.name,
					id: currentUser.organisationalUnit.id
				}, formattedOtherOrganisations)

				pageModel.showWholeCivilServiceOption = currentUser.isReportingAllOrganisations()

				response.render('page/reporting/courseCompletions/choose-organisation', {pageModel})
			}
			else {
				response.render("page/unauthorised")
			}

		}
	}

	submitOrganisationSelection() {
		return async (request: Request, response: Response) => {
			const session = fetchCourseCompletionSessionObject(request)

			let currentUser = request.user
			session.organisationFormSelection = request.body.organisation

			const selectedOrganisationIds = this.getSelectedOrganisationIdsFromSubmitRequest(request)

			session.selectedOrganisations = selectedOrganisationIds ? await Promise.all(selectedOrganisationIds?.map(async id => {
				const organisation = await this.organisationalUnitService.getOrganisation(id)
				return { name: organisation.name, id: organisation.id.toString(), abbreviation: organisation.abbreviation || '' }
			})) : undefined

			const submitModel = new SubmitOrganisationsModel(session.selectedOrganisations)
			const validationErrors = await this.getValidationErrors(submitModel)
			if(validationErrors.length > 0){
				request.session!.sessionFlash = {
					errors: validationErrors
				}
				return request.session!.save(() => {
					response.redirect('/reporting/course-completions/choose-organisation')
				})
			}

			if (session.organisationFormSelection) {
				if (currentUser && currentUser.isOrganisationReporter() && currentUser.isMVPReporter()) {

					saveCourseCompletionSessionObject(session, request, async () => {
						if (session.hasSelectedCourses()) {
							response.redirect(`/reporting/course-completions`)
						} else {
							response.redirect(`/reporting/course-completions/choose-courses`)
						}
					})

				}
				else {
					response.render("page/unauthorised")
				}
			}
			else {
				request.session!.sessionFlash = {
					errors: ["You need to select an organisation before continuing."]
				}

				return request.session!.save(() => {
					response.redirect('/reporting/course-completions/choose-organisation')
				})
			}

		}
	}

	getSelectedOrganisationIdsFromSubmitRequest(request: Request): number[] | undefined{
		let selectedOrganisationIds: number[] | undefined = []

		const organisationFormSelection: string = request.body.organisation

		if (organisationFormSelection && !Number.isNaN(parseInt(organisationFormSelection))) {
			selectedOrganisationIds = [parseInt(organisationFormSelection)]
		}
		if (organisationFormSelection === "other") {
			selectedOrganisationIds = request.body.organisationId ? [request.body.organisationId] : []
		}
		if (organisationFormSelection === "allOrganisations") {
			selectedOrganisationIds = undefined
		}
		if (organisationFormSelection === "multiple-organisations") {
			let organisationIds: number[] = []
			if(request.body.organisationSearch){
				if(typeof request.body.organisationSearch === 'string'){
					organisationIds = [parseInt(request.body.organisationSearch)]
				}
				else{
					organisationIds = request.body.organisationSearch.map((id: string) => parseInt(id))
				}
			}
			selectedOrganisationIds = organisationIds
		}

		return selectedOrganisationIds

	}

	async getValidationErrors(submitModel: SubmitOrganisationsModel){
		const validationErrors = await validate(submitModel)
			const errors = validationErrors.map(error => error.constraints).map(constraint => Object.values(constraint)).flat()
			return errors
	}


}
