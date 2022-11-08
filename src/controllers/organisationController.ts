import {NextFunction, Request, Response, Router} from 'express'
import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
import * as asyncHandler from 'express-async-handler'
import {FormController} from './formController'
import {Validator} from '../learning-catalogue/validator/validator'
import {Validate} from './formValidator'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import { getLogger } from '../utils/logger'
import { OrganisationalUnitPageModel } from '../csrs/model/organisationalUnitPageModel'
import { OrganisationalUnitTypeAhead } from '../csrs/model/organisationalUnitTypeAhead'
import { OrganisationalUnitPageModelFactory } from '../csrs/model/organisationalUnitPageModelFactory'
const { xss } = require('express-xss-sanitizer')


export class OrganisationController implements FormController {
	logger = getLogger('OrganisationController')
	router: Router
	validator: Validator<OrganisationalUnitPageModel>
	organisationalUnitPageModelFactory: OrganisationalUnitPageModelFactory
	organisationalUnitService: OrganisationalUnitService

	constructor(
		validator: Validator<OrganisationalUnitPageModel>,
		organisationalUnitPageModelFactory: OrganisationalUnitPageModelFactory,
		organisationalUnitService: OrganisationalUnitService) {
		this.router = Router()
		this.organisationalUnitService = organisationalUnitService
		this.validator = validator
		this.organisationalUnitPageModelFactory = organisationalUnitPageModelFactory
		this.organisationalUnitService = organisationalUnitService

		this.getOrganisationFromRouterParamAndSetOnLocals()

		this.setRouterPaths()
	}

	/* istanbul ignore next */
	// prettier-ignore
	private getOrganisationFromRouterParamAndSetOnLocals() {
		this.router.param('organisationalUnitId', asyncHandler(async (req: Request, res: Response, next: NextFunction, organisationalUnitId: number) => {
				const organisationalUnit: OrganisationalUnit = await this.organisationalUnitService.getOrganisation(organisationalUnitId, true)

				if (organisationalUnit) {
					res.locals.organisationalUnit = organisationalUnit
					next()
				} else {
					res.sendStatus(404)
				}
			})
		)
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		this.router.get('/content-management/organisations/manage', xss(), asyncHandler(this.getOrganisationList()))
		this.router.get('/content-management/organisations/:organisationalUnitId?', xss(), asyncHandler(this.addEditOrganisation()))
		this.router.get('/content-management/organisations/:organisationalUnitId/overview', xss(), asyncHandler(this.organisationOverview()))
		this.router.post('/content-management/organisations/', xss(), asyncHandler(this.createOrganisation()))
		this.router.post('/content-management/organisations/:organisationalUnitId', xss(), asyncHandler(this.updateOrganisation()))
		this.router.get('/content-management/organisations/:organisationalUnitId/confirm-delete', xss(), asyncHandler(this.confirmDelete()))
		this.router.post('/content-management/organisations/:organisationalUnitId/delete', xss(), asyncHandler(this.deleteOrganisation()))
		this.router.get('/content-management/organisations/:organisationalUnitId/unlink-parent-confirm', xss(), asyncHandler(this.confirmParentOrganisationRemoval()))
		this.router.post('/content-management/organisations/:organisationalUnitId/unlink-parent', xss(), asyncHandler(this.unlinkParentOrganisation()))
		
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
			const typeahead: OrganisationalUnitTypeAhead = await this.organisationalUnitService.getOrgDropdown()
			response.render('page/organisation/add-edit-organisation', {organisationalUnits: typeahead.typeahead})
		}
	}

	@Validate({
		fields: ['all'],
		redirect: '/content-management/organisations',
	})
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

				request.session!.sessionFlash = {errors: errors}

				return request.session!.save(() => {
					response.redirect(`/content-management/organisations`)
				})
			}
		}
	}

	@Validate({
		fields: ['all'],
		redirect: '/content-management/organisations/:organisationalUnitId',
	})
	public updateOrganisation() {
		return async (request: Request, response: Response) => {
			let organisationalUnit = response.locals.organisationalUnit

			this.logger.debug(`Updating organisation: ${organisationalUnit.id}`)

			const data: OrganisationalUnitPageModel =  {
				name: request.body.name || organisationalUnit.name,
				abbreviation: request.body.abbreviation || organisationalUnit.abbreviation,
				code: request.body.code || organisationalUnit.code,
				parentId: request.body.parentId,
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

			const data: OrganisationalUnitPageModel = {
				name: organisationalUnit.name,
				abbreviation: organisationalUnit.abbreviation,
				code: organisationalUnit.code,
				parentId: null
			}

			this.logger.debug(`Unlinking parent organisation from organisation: ${organisationalUnit.id}`)

			await this.organisationalUnitService.updateOrganisationalUnit(organisationalUnit.id, data)
		
			response.redirect(`/content-management/organisations/${organisationalUnit.id}/overview`)
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
