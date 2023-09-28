import {Request, Response} from 'express'
import {Domain} from 'domain'
import {Validator} from '../learning-catalogue/validator/validator'
import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import asyncHandler from 'express-async-handler'
import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
const { xss } = require('express-xss-sanitizer')

export class OrganisationalUnitDomainsController extends OrganisationalUnitControllerBase<Domain> {
	constructor(
		validator: Validator<Domain>,
		organisationalUnitService: OrganisationalUnitService,
	) {
		super(validator, organisationalUnitService)
	}

	protected setRouterPaths() {
		this.router.get('/content-management/organisations/:organisationalUnitId/domains', xss(), asyncHandler(this.viewDomains()))
	}

	public viewDomains() {
		return async (request: Request, response: Response) => {
			const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
			if (organisationalUnit.domains && !request.session!.organisationalUnitDomains) {
				request.session!.organisationalUnitDomains = organisationalUnit.domains.map(domain => {
					return domain.domain
				})
			}

			const organisationalUnitDomains = request.session!.organisationalUnitDomains

			request.session!.save(() => {
				response.render('page/organisation/view-domains', {
					organisationalUnit, organisationalUnitDomains
				})
			})
		}
	}

	protected getControllerName(): string {
		return 'OrganisationalUnitDomainsController'
	}

}
