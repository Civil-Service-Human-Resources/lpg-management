import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {Request, Response} from 'express'
import {AgencyTokenService} from '../../lib/agencyTokenService'
import {EditAgencyToken} from './model/editAgencyToken'

export class AgencyTokenController extends OrganisationalUnitControllerBase {

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
			getRequest('/:organisationalUnitId/agency-token/delete', this.renderDeleteAgencyToken()),
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
		let pageModel = this.agencyTokenPageModelSession.fetchObjectFromSession(request)
		if (pageModel === undefined) {
			pageModel = this.agencyTokenService.renderAgencyTokenPage(response.locals.organisationalUnit)
			this.agencyTokenPageModelSession.saveObjectToSession(request, pageModel)
		}
		console.log(pageModel)
		return pageModel
	}

	public validatePageModel = async (request: Request, response: Response) => {
		const pageModel = await this.getPageModel(request, response)
		pageModel.validateAndUpdateWithEditAgencyTokenModel(response.locals.input)
		this.agencyTokenPageModelSession.saveObjectToSession(request, pageModel)
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
			this.agencyTokenPageModelSession.saveObjectToSession(request, pageModel)
			return response.render('page/organisation/add-edit-agency-token', {pageModel})
		}
	}

	private editAgencyToken() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.validatePageModel(request, response)
			if (!pageModel.hasErrors()) {
				await this.organisationalUnitService.updateAgencyToken(pageModel.organisationId, pageModel)
				return response.redirect(`/content-management/organisations/${pageModel.organisationId}/overview`)
			}
			return response.status(400).render('page/organisation/add-edit-agency-token', {pageModel})
		}
	}

	private createAgencyToken() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.validatePageModel(request, response)
			if (!pageModel.hasErrors()) {
				await this.organisationalUnitService.createAgencyToken(pageModel.organisationId, pageModel)
				return response.redirect(`/content-management/organisations/${pageModel.organisationId}/overview`)
			}
			return response.status(400).render('page/organisation/add-edit-agency-token', {pageModel})
		}
	}

	private renderDeleteAgencyToken() {
		return async (request: Request, response: Response) => {
			return response.render('page/organisation/delete-agency-token')
		}
	}

	private deleteAgencyToken() {
		return async (request: Request, response: Response) => {
			const organisationalUnit = response.locals.organisationalUnit
			await this.organisationalUnitService.deleteAgencyToken(organisationalUnit)
			request.session!.sessionFlash = {displayAgencyTokenRemovedMessage: true}
			return response.redirect(`/content-management/organisations/${organisationalUnit.id}/overview`)
		}
	}

}
