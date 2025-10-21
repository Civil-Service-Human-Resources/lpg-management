import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import {getRequest, postRequest, postRequest, postRequestWithBody, Route} from '../route'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {Request, Response} from 'express'
import {AgencyTokenService} from 'lib/agencyTokenService'
import {EditAgencyToken} from './model/editAgencyToken'
import {SessionableObjectService} from '../reporting/utils'
import * as console from 'node:console'

export class AgencyTokenController extends OrganisationalUnitControllerBase {

	private pageModelSession = new SessionableObjectService("agencyTokenPageModel", EditAgencyToken)

	constructor(
		protected organisationalUnitService: OrganisationalUnitService,
		protected agencyTokenService: AgencyTokenService,
	) {
		super('AgencyTokenController', organisationalUnitService)
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/:organisationalUnitId/agency-token', this.viewAgencyToken()),
			postRequestWithBody('/:organisationalUnitId/agency-token', this.createAgencyToken(), {
				dtoClass: EditAgencyToken,
				groups: ['all'],
				onError: {
					behaviour: BehaviourOnError.SET_LOCALS
				}
			}),
			postRequestWithBody('/:organisationalUnitId/agency-token/edit', this.editAgencyToken(), {
				dtoClass: EditAgencyToken,
				groups: ['all'],
				onError: {
					behaviour: BehaviourOnError.SET_LOCALS
				}
			}),
			postRequest('/:organisationalUnitId/agency-token/delete', this.deleteAgencyToken()),
			postRequestWithBody('/:organisationalUnitId/agency-token/domains', this.editDomains(), {
				dtoClass: EditAgencyToken,
				groups: ['addDomain'],
				onError: {
					behaviour: BehaviourOnError.SET_LOCALS
				}
			})
		]
	}

	public getPageModel = async (request: Request, response: Response) => {
		let pageModel = this.pageModelSession.fetchObjectFromSession(request)
		if (pageModel === undefined) {
			pageModel = await this.agencyTokenService.renderAgencyTokenPage(response.locals.organisationalUnit)
			this.pageModelSession.saveObjectToSession(request, pageModel)
		}
		return pageModel
	}

	public viewAgencyToken() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.getPageModel(request, response)
			return response.render('page/organisation/add-edit-agency-token', {pageModel})
		}
	}

	public editDomains() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.getPageModel(request, response)
			pageModel.validateAddDomain(response.locals.input, request.query.domainToRemove as string | undefined)
			this.pageModelSession.saveObjectToSession(request, pageModel)
			return response.render('page/organisation/add-edit-agency-token', {pageModel})
		}
	}

	private editAgencyToken() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.getPageModel(request, response)
			pageModel.validateAndUpdateWithEditAgencyTokenModel(response.locals.input)
			this.pageModelSession.saveObjectToSession(request, pageModel)
			if (!pageModel.hasErrors()) {
				this.organisationalUnitService.updateAgencyToken(pageModel.organisationId, pageModel)
			}
			this.pageModelSession.deleteObjectFromSession(request)
			return response.redirect(`/content-management/organisations/${pageModel.organisationId}/overview`)
		}
	}
}
