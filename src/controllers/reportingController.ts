import { Request, Response, Router } from 'express'
import { ReportService } from '../report-service'
import { CsrsService } from 'src/csrs/service/csrsService'
import { OrganisationalUnitService } from 'src/csrs/service/organisationalUnitService'
import { OrganisationalUnit } from '../../src/csrs/model/organisationalUnit'
import { fetchCourseCompletionSessionObject, saveCourseCompletionSessionObject } from './reporting/utils'
import { CslServiceClient } from 'src/csl-service/client'
import { ChooseOrganisationsModel } from './reporting/model/chooseOrganisationsModel'
import { SubmitOrganisationsModel } from './reporting/model/submitOrganisationsModel'
import { validate } from 'class-validator'
import { FormattedOrganisation } from 'src/csl-service/model/FormattedOrganisation'

const { xss } = require('express-xss-sanitizer')


export class ReportingController {
	router: Router
	reportService: ReportService
	csrsService: CsrsService
	cslServiceClient: CslServiceClient
	organisationalUnitService: OrganisationalUnitService

	constructor(
		reportService: ReportService,
		csrsService: CsrsService,
		organisationalUnitService: OrganisationalUnitService,
		cslServiceClient: CslServiceClient
	) {
		this.router = Router()
		this.configureRouterPaths()
		this.reportService = reportService
		this.csrsService = csrsService
		this.organisationalUnitService = organisationalUnitService
		this.cslServiceClient = cslServiceClient
	}

	private configureRouterPaths() {
		this.router.get('/reporting/course-completions/choose-organisation', xss(), this.getChooseOrganisationPage())
		this.router.post('/reporting/course-completions/choose-organisation', xss(), this.submitOrganisationSelection())
	}

	getChooseOrganisationPage() {
		return async (request: Request, response: Response) => {
			let currentUser = request.user

			if (currentUser && currentUser.isOrganisationReporter() && currentUser.isMVPReporter()) {
				let organisationChoices = await this.getOrganisationChoicesForUser(currentUser)
				let userCanAccessMultipleOrganisations: boolean = organisationChoices.typeaheadOrganisations.length > 1

				const otherOrganisationIds = currentUser.otherOrganisationalUnits.map((o: { id: any }) => o.id)
				const formattedOtherOrganisations: FormattedOrganisation[] = (await this.cslServiceClient.getFormattedOrganisationList(otherOrganisationIds, currentUser.getDomain())).formattedOrganisationalUnitNames

				const pageModel = new ChooseOrganisationsModel({
					name: organisationChoices.directOrganisation.name,
					id: organisationChoices.directOrganisation.id
				}, organisationChoices.typeaheadOrganisations,
					formattedOtherOrganisations)

				pageModel.showTypeaheadOption = userCanAccessMultipleOrganisations
				pageModel.showWholeCivilServiceOption = currentUser.isReportingAllOrganisations()
				pageModel.showMultipleOrganisationsOption = formattedOtherOrganisations.length > 0

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
				return { name: organisation.name, id: organisation.id.toString() }
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
			selectedOrganisationIds = [request.body.organisationId]
		}
		if (organisationFormSelection === "allOrganisations") {
			selectedOrganisationIds = undefined
		}
		if (organisationFormSelection === "multiple-organisations") {				
			let organisationIds: number[] = []
			if(request.body.organisationSearch){
				if(request.body.organisationSearch === 'string'){
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

	async getOrganisationChoicesForUser(user: any) {
		return {
			directOrganisation: user.organisationalUnit,
			typeaheadOrganisations: await this.csrsService.getOrganisationalUnitsForUser(user)
		}
	}

	async getOrganisationWithAllChildren(organisationId: number): Promise<number[]> {
		let organisationWithChildren = (await this.organisationalUnitService.getOrgDropdown())
			.getOrgWithChildren(organisationId)

		let allChildren: OrganisationalUnit[] | undefined = organisationWithChildren ? this.getAllChildOrganisations(organisationWithChildren) : undefined

		let childOrganisationIds = allChildren ? allChildren.map(child => child.id) : [organisationId]
		childOrganisationIds = [...new Set(childOrganisationIds)]

		return childOrganisationIds
	}

	getAllChildOrganisations(organisation: OrganisationalUnit): OrganisationalUnit[] {
		return [organisation, organisation.children.flatMap(child => this.getAllChildOrganisations(child))].flatMap(item => item)
	}

	async getValidationErrors(submitModel: SubmitOrganisationsModel){
		const validationErrors = await validate(submitModel)
			const errors = validationErrors.map(error => error.constraints).map(constraint => Object.values(constraint)).flat()			
			return errors
	}


}
