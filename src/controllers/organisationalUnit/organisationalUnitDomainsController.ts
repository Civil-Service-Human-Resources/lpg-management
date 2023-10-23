import {NextFunction, Request, Response} from 'express'
import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {DomainPageModel} from '../../csrs/model/domainPageModel'
import {getRequest, postRequest, postRequestWithBody, Route} from '../route'
import {BehaviourOnError} from '../../validators/validatorMiddleware'
import {Domain} from '../../csrs/model/domain'

export class OrganisationalUnitDomainsController extends OrganisationalUnitControllerBase {

	constructor(
		protected organisationalUnitService: OrganisationalUnitService,
	) {
		super('OrganisationalUnitDomainsController', organisationalUnitService)
		this.getDomainFromRouterParamAndSetOnLocals()
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/:organisationalUnitId/domains', this.viewDomains()),
			postRequestWithBody('/:organisationalUnitId/domains', this.addDomain(), {
				dtoClass: DomainPageModel,
				onError: {
					behaviour: BehaviourOnError.RENDER_TEMPLATE,
					path: 'page/organisation/view-domains'
				}
			}),
			getRequest('/:organisationalUnitId/domains/:domainId/delete', this.renderRemoveDomain()),
			postRequest('/:organisationalUnitId/domains/:domainId/delete', this.removeDomain())
		]
	}

	private getDomainFromRouterParamAndSetOnLocals() {
		this.router.param('domainId', (req: Request, res: Response, next: NextFunction) => {
			let organisationalUnit: OrganisationalUnit = res.locals.organisationalUnit
			let domain = organisationalUnit.domains.find(d => d.id.toString() === req.params.domainId)
			if (domain) {
				res.locals.domain = domain
				next()
			} else {
				res.sendStatus(404)
			}
		})
	}

	private viewDomains() {
		return async (request: Request, response: Response) => {
			response.render('page/organisation/view-domains')
		}
	}

	private addDomain() {
		return async (request: Request, response: Response) => {
			let organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
			if (organisationalUnit.doesDomainExist(request.body.domainToAdd)) {
				const error = {fields: {domainToAdd: ['domains.validation.domains.alreadyExists']}, size: 1}
				response.status(400)
				return response.render('page/organisation/view-domains', {
					organisationalUnit, errors: error
				})
			}
			const domainStr: string = response.locals.input.domainToAdd
			const domainUpdateSuccess = await this.organisationalUnitService.addDomain(organisationalUnit.id, domainStr)
			return response.render('page/organisation/view-domains', { domainUpdateSuccess, organisationalUnit: domainUpdateSuccess.organisationalUnit })
		}
	}

	private renderRemoveDomain() {
		return async (request: Request, response: Response) => {
			return response.render('page/organisation/delete-domain')
		}
	}

	private removeDomain() {
		return async (request: Request, response: Response) => {
			let organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
			let domain: Domain = response.locals.domain
			const domainUpdateSuccess = await this.organisationalUnitService.removeDomain(organisationalUnit.id, domain.id)
			request.session!.sessionFlash = { domainUpdateSuccess }
			return request.session!.save(() => {
				response.redirect(`/content-management/organisations/${organisationalUnit.id}/domains`)
			})
		}
	}
}
