import {Request, Response} from 'express'
import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {DomainPageModel} from '../../csrs/model/domainPageModel'
import {getRequest, postRequest, Route} from '../route'
import {BehaviourOnError} from '../../validators/validatorMiddleware'

export class OrganisationalUnitDomainsController extends OrganisationalUnitControllerBase {

	constructor(
		protected organisationalUnitService: OrganisationalUnitService,
	) {
		super('OrganisationalUnitDomainsController', organisationalUnitService)
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/:organisationalUnitId/domains', this.viewDomains()),
			postRequest('/:organisationalUnitId/domains', this.addDomain(), {
				dtoClass: DomainPageModel,
				onError: {
					behaviour: BehaviourOnError.RENDER_TEMPLATE,
					path: 'page/organisation/view-domains'
				}
			})
		]
	}

	private viewDomains() {
		return async (request: Request, response: Response) => {
			const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
			response.render('page/organisation/view-domains', {
				organisationalUnit
			})
		}
	}

	private addDomain() {
		return async (request: Request, response: Response) => {
			let organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
			if (organisationalUnit.doesDomainExist(request.body.domainToAdd)) {
				const error = {fields: {domainToAdd: ['domains.validation.domains.alreadyExists']}, size: 1}
				response.render('page/organisation/view-domains', {
					organisationalUnit, errors: error
				})
			}
			const domainStr: string = response.locals.input.domainToAdd
			organisationalUnit = await this.organisationalUnitService.addDomain(organisationalUnit.id, domainStr)
			response.render('page/organisation/view-domains', {
				organisationalUnit
			})
		}
	}


}
