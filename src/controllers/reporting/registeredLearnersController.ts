import {Controller} from '../controller'
import {CompoundRoleBase, mvpExportRole, registeredLearnerReportingRole} from '../../identity/identity'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {ChooseOrganisationsModel} from './model/chooseOrganisationsModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {OrganisationPageModelService} from './organisationPageModelService'
import {
	fetchChooseOrganisationSessionObject,
	fetchCourseCompletionSessionObject,
	saveChooseOrganisationSessionObject,
} from './utils'
import {roleCheckMiddleware} from '../middleware/roleCheckMiddleware'
import {ReportExportService} from './reportExportService'
import {Report} from './Report'

export class RegisteredLearnersController extends Controller {

	constructor(private organisationPageModelService: OrganisationPageModelService,
				private reportExportService: ReportExportService) {
		super("/reporting/registered-learners", 'RegisteredLearnersController')
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return registeredLearnerReportingRole.compoundRoles
	}

	private checkForOrgIdsInSessionMiddleware() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const session = fetchChooseOrganisationSessionObject(request)

			if (session === undefined || !session.hasSelectedOrganisations()) {
				return response.redirect("/reporting/registered-learners/choose-organisation")
			}
			next()
		}
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/', this.renderPage(), [this.checkForOrgIdsInSessionMiddleware()]),
			getRequest('/choose-organisation', this.renderChooseOrganisations()),
			postRequestWithBody('/choose-organisation', this.chooseOrganisations(),
				{
					dtoClass: ChooseOrganisationsModel,
					onError: {
						behaviour: BehaviourOnError.REDIRECT,
						path: '/reporting/registered-learners/choose-organisation'
					}
				}),
			postRequest("/download-source-data", this.submitExportRequestNoJs(), [
				roleCheckMiddleware(mvpExportRole)
			]),
			postRequest("/download-source-data/js", this.submitExportRequestJs(), [
				roleCheckMiddleware(mvpExportRole)
			]),
			getRequest("/download-report/:urlSlug", this.reportExportService.downloadExtract(Report.REGISTERED_LEARNERS))
		]
	}

	private async submitExportRequest(request: Request, response: Response) {
		const session = fetchChooseOrganisationSessionObject(request)!
		return await this.reportExportService.submitRegisteredLearnerExportRequest(session)
	}


	public submitExportRequestNoJs() {
		return async (request: Request, response: Response) => {
			await this.submitExportRequest(request, response)
			return response.redirect('/reporting/registered-learners')
		}
	}

	public submitExportRequestJs() {
		return async (request: Request, response: Response) => {
			await this.submitExportRequest(request, response)
			response.status(200)
			return response.send()
		}
	}

	renderChooseOrganisations() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.organisationPageModelService.renderChooseOrganisation(request)
			response.render('page/reporting/registeredLearners/choose-organisation', {pageModel})
		}
	}

	renderPage() {
		return async (request: Request, response: Response) => {
			const session = fetchChooseOrganisationSessionObject(request)
			const organisationDepartments = session.organisationFormSelection == 'allOrganisations' ? 'all organisations' : session.selectedOrganisations!.length > 1 ? session.selectedOrganisations!.map(o => o.getAbbreviationOrName()).join(" - ") : session.selectedOrganisations![0].name
			const overview = await this.reportExportService.getRegisteredLearnerOverview()
			return response.render('page/reporting/registeredLearners/download-report', {pageModel: {organisationDepartments, hasRequestReport: overview.hasRequests}})
		}
	}

	private chooseOrganisations() {
		return async (request: Request, response: Response) => {
			let session = fetchCourseCompletionSessionObject(request)
			await this.organisationPageModelService.handleSubmit(request, response, session)
			saveChooseOrganisationSessionObject(session, request, async () => {
				if (!response.headersSent) {
					response.redirect('/reporting/registered-learners')
				}
			})
		}
	}
}
