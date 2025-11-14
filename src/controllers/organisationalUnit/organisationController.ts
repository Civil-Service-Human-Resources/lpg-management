import {NextFunction, Request, Response} from 'express'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import { OrganisationalUnitPageModel } from '../../csrs/model/organisationalUnitPageModel'
import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
import {FormattedOrganisation} from '../../csl-service/model/organisationalUnit/FormattedOrganisation'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {plainToInstance} from 'class-transformer'

export class OrganisationController extends OrganisationalUnitControllerBase {
	constructor(
		organisationalUnitService: OrganisationalUnitService) {
		super('OrganisationController', organisationalUnitService)
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/manage', this.getOrganisationList()),
			getRequest('/:organisationalUnitId?', this.addEditOrganisation()),
			getRequest('/:organisationalUnitId/overview', this.organisationOverview()),
			postRequestWithBody('/', this.createOrganisation(), {
				dtoClass: OrganisationalUnitPageModel,
				onError: {
					behaviour: BehaviourOnError.RENDER_TEMPLATE,
					path: 'page/organisation/add-edit-organisation'
				}
			}),
			postRequestWithBody('/:organisationalUnitId', this.updateOrganisation(), {
				dtoClass: OrganisationalUnitPageModel,
				onError: {
					behaviour: BehaviourOnError.RENDER_TEMPLATE,
					path: 'page/organisation/add-edit-organisation'
				}
			}),
			getRequest('/:organisationalUnitId/confirm-delete', this.confirmDelete()),
			postRequest('/:organisationalUnitId/delete', this.deleteOrganisation()),
			getRequest('/:organisationalUnitId/unlink-parent-confirm', this.confirmParentOrganisationRemoval()),
			postRequest('/:organisationalUnitId/unlink-parent', this.unlinkParentOrganisation())
		]
	}

	public getOrganisationList() {
		return async (request: Request, response: Response, next: NextFunction) => {
			await this.organisationalUnitService
				.getOrgTree()
				.then(organisationalUnits => {
					response.render('page/organisation/manage-organisations', {organisationalUnits})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	public organisationOverview() {
		return async (request: Request, response: Response) => {
			this.agencyTokenPageModelSession.deleteObjectFromSession(request)
			response.render('page/organisation/organisation-overview')
		}
	}

	public addEditOrganisation() {
		return async (request: Request, response: Response) => {
			const organisationalUnits: FormattedOrganisation[] = await this.organisationalUnitService.getAllOrganisationsTypeahead()
			response.render('page/organisation/add-edit-organisation', {organisationalUnits})
		}
	}

	public createOrganisation() {
		return async (request: Request, response: Response) => {
			const pageModel = plainToInstance(OrganisationalUnitPageModel, response.locals.input as OrganisationalUnitPageModel)
			this.logger.debug(`Creating new organisation: ${pageModel.name}`)

			try {
				const newOrganisationalUnit: OrganisationalUnit = await this.organisationalUnitService.createOrganisationalUnit(pageModel)
				request.session!.sessionFlash = {organisationAddedSuccessMessage: 'organisationAddedSuccessMessage'}
				response.redirect(`/content-management/organisations/${newOrganisationalUnit.id}/overview`)
			} catch (e) {
				this.logger.error(`Error creating organisational unit: ${e}`)
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
			const pageModel = plainToInstance(OrganisationalUnitPageModel, response.locals.input as OrganisationalUnitPageModel)
			this.logger.debug(`Updating organisation: ${organisationalUnit.id}`)

			if (pageModel.parentId != undefined && pageModel.parentId === organisationalUnit.id) {
				request.session!.sessionFlash = {errors: {fields: {parentId: ['organisations.validation.organisation.selfReference'], size: 1}}}

				return request.session!.save(() => {
					response.redirect(`/content-management/organisations/${organisationalUnit.id}`)
				})
			}

			try {
				await this.organisationalUnitService.updateOrganisationalUnit(organisationalUnit, pageModel)
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
			const data = new OrganisationalUnitPageModel(organisationalUnit.name,
				organisationalUnit.code, organisationalUnit.abbreviation, null)
			organisationalUnit  = await this.organisationalUnitService.updateOrganisationalUnit(organisationalUnit, data)
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

}
