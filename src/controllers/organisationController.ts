import {Request, Response, Router} from 'express'
import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
import {Csrs} from '../csrs/index'
import {DefaultPageResults} from '../learning-catalogue/model/defaultPageResults'
import * as asyncHandler from 'express-async-handler'
import {OrganisationalUnitFactory} from '../csrs/model/organisationalUnitFactory'
import {FormController} from './formController'
import {Validator} from '../learning-catalogue/validator/validator'
import {Validate} from './formValidator'

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
			response.render('/content-management/organisations')
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

			await this.csrs.createOrganisationalUnit(organisationalUnit)

			response.redirect(`/content-management/organisations`)
		}
	}
}
