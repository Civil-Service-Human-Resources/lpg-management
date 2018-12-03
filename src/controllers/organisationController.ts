import {Request, Response, Router} from 'express'
import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
import {Csrs} from '../csrs/index'
import {DefaultPageResults} from '../learning-catalogue/model/defaultPageResults'
import * as asyncHandler from 'express-async-handler'
import {OrganisationalUnitFactory} from '../csrs/model/organisationalUnitFactory'
import {FormController} from './formController'
import {Validator} from '../learning-catalogue/validator/validator'
import {Validate} from './formValidator'
import {OrganisationalUnitService} from "../csrs/service/organisationalUnitService"

export class OrganisationController implements FormController {
	router: Router
	csrs: Csrs
	organisationalUnitFactory: OrganisationalUnitFactory
	validator: Validator<OrganisationalUnit>
	organisationalUnitService: OrganisationalUnitService

	constructor(csrs: Csrs, organisationalUnitFactory: OrganisationalUnitFactory, validator: Validator<OrganisationalUnit>, organisationalUnitService: OrganisationalUnitService) {
		this.router = Router()
		this.csrs = csrs
		this.organisationalUnitFactory = organisationalUnitFactory
		this.validator = validator
		this.organisationalUnitService = organisationalUnitService

		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		this.router.get('/content-management/organisations', asyncHandler(this.getOrganisations()))
		this.router.get('/content-management/add-organisation', asyncHandler(this.addOrganisation()))
		this.router.get('/content-management/organisations/:organisationId/overview', asyncHandler(this.getOrganisation()))
		this.router.get('/content-management/organisations/:organisationId/confirm-delete', asyncHandler(this.confirmDelete()))
		this.router.post('/content-management/organisations/:organisationId/delete', asyncHandler(this.deleteOrganisation()))
		this.router.post('/content-management/organisations/organisation', asyncHandler(this.createOrganisation()))
	}

	public getOrganisations() {
		return async (request: Request, response: Response) => {
			const organisationalUnits: DefaultPageResults<OrganisationalUnit> = await this.csrs.listOrganisationalUnits()

			response.render('page/organisation/manage-organisations', {organisationalUnits: organisationalUnits})
		}
	}

	public getOrganisation() {
		return async (request: Request, response: Response) => {
			const organisationalUnitId = request.params.organisationId

			const organisationalUnit: OrganisationalUnit = await this.organisationalUnitService.getOrganisationalUnit(`organisationalUnits/${organisationalUnitId}`)

			response.render('page/organisation/organisation-overview', {organisationalUnit: organisationalUnit})
		}
	}

	public addOrganisation() {
		return async (request: Request, response: Response) => {
			const organisationalUnits: DefaultPageResults<OrganisationalUnit> = await this.csrs.listOrganisationalUnitsForTypehead()

			response.render('page/organisation/add-organisation', {organisationalUnits: organisationalUnits})
		}
	}
	@Validate({
		fields: ['all'],
		redirect: '/content-management/add-organisation',
	})
	public createOrganisation() {
		return async (request: Request, response: Response) => {
			const organisationalUnit = this.organisationalUnitFactory.create(request.body)

			try {
				const newOrganisationalUnit: OrganisationalUnit = await this.csrs.createOrganisationalUnit(organisationalUnit)

				request.session!.sessionFlash = {organisationAddedSuccessMessage: 'organisationAddedSuccessMessage'}

				response.redirect(`/content-management/organisations/${newOrganisationalUnit.id}/overview`)
			} catch (e) {
				const errors = {fields: {fields: ['organisations.validation.organisation.alreadyExists'], size: 1}}

				request.session!.sessionFlash = {errors: errors}
				return request.session!.save(() => {
					response.redirect(`/content-management/add-organisation`)
				})
			}
		}
	}

	public confirmDelete(){
		return async (request: Request, response: Response) => {
			const organisationId = request.params.organisationId

			response.render('page/organisation/confirm-delete', {organisationId: organisationId})
		}
	}

	public deleteOrganisation(){
		return async (request: Request, response: Response) => {
			const organisationId = request.params.organisationId

			await this.csrs.deleteOrganisationalUnit(organisationId)

			response.redirect('/content-management/organisations')
		}
	}
}
