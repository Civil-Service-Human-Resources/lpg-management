import {NextFunction, Request, Response} from 'express'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import { OrganisationalUnitPageModel } from '../../csrs/model/organisationalUnitPageModel'
import { OrganisationalUnitPageModelFactory } from '../../csrs/model/organisationalUnitPageModelFactory'
import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
import {FormattedOrganisation} from '../../csl-service/model/FormattedOrganisation'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {BehaviourOnError} from '../../validators/validatorMiddleware'

export class OrganisationController extends OrganisationalUnitControllerBase {
	constructor(
		private organisationalUnitPageModelFactory: OrganisationalUnitPageModelFactory,
		organisationalUnitService: OrganisationalUnitService) {
		super('OrganisationController', organisationalUnitService)
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/content-management/organisations/manage', this.getOrganisationList()),
			getRequest('/content-management/organisations/:organisationalUnitId?', this.addEditOrganisation()),
			getRequest('/content-management/organisations/:organisationalUnitId/overview', this.organisationOverview()),
			postRequestWithBody('/content-management/organisations/', this.createOrganisation(), {
				dtoClass: OrganisationalUnitPageModel,
				onError: {
					behaviour: BehaviourOnError.RENDER_TEMPLATE,
					path: 'page/organisation/organisation-overview'
				}
			}),
			postRequestWithBody('/content-management/organisations/:organisationalUnitId', this.updateOrganisation(), {
				dtoClass: OrganisationalUnitPageModel,
				onError: {
					behaviour: BehaviourOnError.RENDER_TEMPLATE,
					path: 'page/organisation/organisation-overview'
				}
			}),
			getRequest('/content-management/organisations/:organisationalUnitId/confirm-delete', this.confirmDelete()),
			postRequest('/content-management/organisations/:organisationalUnitId/delete', this.deleteOrganisation()),
			getRequest('/content-management/organisations/:organisationalUnitId/unlink-parent-confirm', this.confirmParentOrganisationRemoval()),
			postRequest('/content-management/organisations/:organisationalUnitId/unlink-parent', this.unlinkParentOrganisation())
		]
	}

	public getOrganisationList() {
		return async (request: Request, response: Response, next: NextFunction) => {
			await this.organisationalUnitService
				.getOrgTree()
				.then(organisationalUnits => {
					response.render('page/organisation/manage-organisations', {organisationalUnits: organisationalUnits})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	public organisationOverview() {
		return async (request: Request, response: Response) => {
			this.deleteAgencyTokenDataStoredInSession(request)

			response.render('page/organisation/organisation-overview')
		}
	}

	public addEditOrganisation() {
		return async (request: Request, response: Response) => {
			const typeahead: FormattedOrganisation[] = await this.cslService.getAllOrganisationsTypeahead()
			response.render('page/organisation/add-edit-organisation', {organisationalUnits: typeahead})
		}
	}

	public createOrganisation() {
		return async (request: Request, response: Response) => {
			const organisationalUnit = this.organisationalUnitPageModelFactory.create(request.body)

			this.logger.debug(`Creating new organisation: ${organisationalUnit.name}`)

			try {
				const newOrganisationalUnit: OrganisationalUnit = await this.organisationalUnitService.createOrganisationalUnit(organisationalUnit)
				request.session!.sessionFlash = {organisationAddedSuccessMessage: 'organisationAddedSuccessMessage'}
				response.redirect(`/content-management/organisations/${newOrganisationalUnit.id}/overview`)
			} catch (e) {
				const errors = {fields: {fields: ['organisations.validation.organisation.alreadyExists'], size: 1}}

				request.session!.sessionFlash = {
					errors: errors,
					form: request.body
				}

				return request.session!.save(() => {
					response.redirect(`/content-management/organisations`)
				})
			}
		}
	}

	public updateOrganisation() {
		return async (request: Request, response: Response) => {
			let organisationalUnit = response.locals.organisationalUnit

			this.logger.debug(`Updating organisation: ${organisationalUnit.id}`)

			const data: OrganisationalUnitPageModel = this.organisationalUnitPageModelFactory.create({
				name: request.body.name || organisationalUnit.name,
				abbreviation: request.body.abbreviation,
				code: request.body.code || organisationalUnit.code,
				parentId: request.body.parentId,
			})

			if (data.parentId != null && data.parentId === organisationalUnit.id) {
				request.session!.sessionFlash = {errors: {fields: {parentId: ['organisations.validation.organisation.selfReference'], size: 1}}}

				return request.session!.save(() => {
					response.redirect(`/content-management/organisations/${organisationalUnit.id}`)
				})
			}

			try {
				await this.organisationalUnitService.updateOrganisationalUnit(organisationalUnit.id, data)
			} catch (e) {
				const errors = {fields: {fields: ['organisations.validation.organisation.alreadyExists'], size: 1}}

				request.session!.sessionFlash = {errors: errors}

				return request.session!.save(() => {
					response.redirect(`/content-management/organisations/${organisationalUnit.id}`)
				})
			}

			response.redirect(`/content-management/organisations/${organisationalUnit.id}/overview`)
		}
	}

	public unlinkParentOrganisation(){
		return async(request: Request, response: Response) => {
			let organisationalUnit = response.locals.organisationalUnit
			this.logger.debug(`Unlinking parent organisation from organisation: ${organisationalUnit.id}`)
			organisationalUnit  = await this.organisationalUnitService.unlinkParent(organisationalUnit.id)
			response.render(`/content-management/organisations/${organisationalUnit.id}/overview`, {pageModel: organisationalUnit})
		}
	}

	public confirmDelete() {
		return async (request: Request, response: Response) => {
			response.render('page/organisation/delete-organisation')
		}
	}

	public confirmParentOrganisationRemoval(){
		return async (request: Request, response: Response) => {
			response.render('page/organisation/remove-parent')
		}
	}

	public deleteOrganisation() {
		return async (request: Request, response: Response) => {
			const organisationalUnit = response.locals.organisationalUnit

			await this.organisationalUnitService.deleteOrganisationalUnit(organisationalUnit.id)

			request.session!.sessionFlash = {organisationRemovedMessage: 'organisationRemovedMessage', organisationalUnit: organisationalUnit}

			response.redirect('/content-management/organisations/manage')
		}
	}

	private deleteAgencyTokenDataStoredInSession(request: any) {
		if (request.session!.domainsForAgencyToken) {
			delete request.session!.domainsForAgencyToken
		}
		if (request.session!.agencyTokenNumber) {
			delete request.session!.agencyTokenNumber
		}
	}
}
