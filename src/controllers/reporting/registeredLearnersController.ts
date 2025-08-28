import {Controller} from '../controller'
import {CompoundRoleBase, registeredLearnerReportingRole} from '../../identity/identity'
import {getRequest, postRequestWithBody, Route} from '../route'
import {NextFunction, Request, Response} from 'express'
import {ChooseOrganisationsModel} from './model/chooseOrganisationsModel'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {OrganisationPageModelService} from './organisationPageModelService'
import {
	fetchChooseOrganisationSessionObject,
	saveChooseOrganisationSessionObject,
} from './utils'

export class RegisteredLearnersController extends Controller {

	constructor(private organisationPageModelService: OrganisationPageModelService) {
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
				})
		]
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
			return response.render('page/reporting/registeredLearners/download-report', {pageModel: {organisationDepartments}})
		}
	}

	private chooseOrganisations() {
		return async (request: Request, response: Response) => {
			let session = fetchChooseOrganisationSessionObject(request)
			session = await this.organisationPageModelService.chooseOrganisations(request, response, session)

			if (!session.hasSelectedOrganisations()) {
				const errors = {fields: {organisation: ["reporting.validation.organisations.minimumOrganisations"]}, size: 1}
				request.session!.sessionFlash = {
					errors,
				}
				return request.session!.save(() => {
					response.redirect('/reporting/registered-learners/choose-organisation')
				})
			}

			saveChooseOrganisationSessionObject(session, request, async () => {
				response.redirect('/reporting/registered-learners')
			})
		}
	}
}
