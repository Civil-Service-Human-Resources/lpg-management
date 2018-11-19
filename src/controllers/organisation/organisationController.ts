import {Request, Response, Router} from 'express'
import {OrganisationalUnit} from './model/organisationalUnit'
import {Csrs} from '../../csrs'
import {DefaultPageResults} from '../../learning-catalogue/model/defaultPageResults'
import * as asyncHandler from 'express-async-handler'
import {OrganisationalUnitFactory} from './model/organisationalUnitFactory'
import {FormController} from '../formController'
import {Validator} from '../../learning-catalogue/validator/validator'
import {Validate} from '../formValidator'

export class OrganisationController implements FormController {
	router: Router
	csrs: Csrs
	organisationalUnitFactory: OrganisationalUnitFactory
	validator: Validator<OrganisationalUnit>

	constructor(csrs: Csrs, organisationalUnitFactory: OrganisationalUnitFactory, validator: Validator<OrganisationalUnit>) {
		this.router = Router()
		this.csrs = csrs
		this.organisationalUnitFactory = organisationalUnitFactory
		this.validator = validator

		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		this.router.get('/content-management/organisations', asyncHandler(this.getOrganisations()))
		this.router.get('/content-management/add-organisation', asyncHandler(this.addOrganisation()))
		this.router.get('/content-management/organisations/:organisationId/overview', asyncHandler(this.getOrganisation()))
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

			const organisationalUnit: OrganisationalUnit = await this.csrs.getOrganisationalUnit(organisationalUnitId)

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

			// const newOrganisationalUnit: OrganisationalUnit = await this.csrs.createOrganisationalUnit(organisationalUnit)
			await this.csrs.createOrganisationalUnit(organisationalUnit)

			request.session!.sessionFlash = {organisationAddedSuccessMessage: 'organisationAddedSuccessMessage'}

			response.redirect(`/content-management/organisations/`)
			// response.redirect(`/content-management/organisations/${newOrganisationalUnit.id}/overview`)
		}
	}
}
