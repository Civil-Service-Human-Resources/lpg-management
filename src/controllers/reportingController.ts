import {Request, Response, Router} from 'express'
import {ReportService} from '../report-service'
import {CsrsService} from 'src/csrs/service/csrsService'
import {OrganisationalUnitService} from 'src/csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../src/csrs/model/organisationalUnit'
import {fetchCourseCompletionSessionObject, saveCourseCompletionSessionObject} from './reporting/utils'

const { xss } = require('express-xss-sanitizer')


export class ReportingController {
	router: Router
	reportService: ReportService
	csrsService: CsrsService
	organisationalUnitService: OrganisationalUnitService

	constructor(
		reportService: ReportService,
		csrsService: CsrsService,
		organisationalUnitService: OrganisationalUnitService
	) {
		this.router = Router()
		this.configureRouterPaths()
		this.reportService = reportService
		this.csrsService = csrsService
		this.organisationalUnitService = organisationalUnitService
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

				response.render('page/reporting/courseCompletions/choose-organisation', {
					firstOrganisationOption: {
						name: organisationChoices.directOrganisation.name,
						id: organisationChoices.directOrganisation.id
					},
					organisationListForTypeAhead: organisationChoices.typeaheadOrganisations,
					showTypeaheadOption: userCanAccessMultipleOrganisations,
				})
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
			let selectedOrganisationId = request.body.organisation

			if (selectedOrganisationId === "other") {
				selectedOrganisationId = request.body.organisationId
			}

			if (selectedOrganisationId) {
				const organisation = (await this.csrsService.getOrganisationalUnitsForUser(currentUser)).find(o => o.id === parseInt(selectedOrganisationId))
				if (currentUser && currentUser.isOrganisationReporter() && currentUser.isMVPReporter() && organisation !== undefined) {
					session.selectedOrganisation = {name: organisation.name, id: organisation.id.toString()}
					session.allOrganisationIds = await this.getOrganisationWithAllChildren(+selectedOrganisationId)
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
		return [organisation, organisation.children.flatMap(child => this.getAllChildOrganisations(child))].flatMap(item=>item)
	}


}
