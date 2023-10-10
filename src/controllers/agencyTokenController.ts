import {NextFunction, Request, Response} from 'express'
import * as asyncHandler from 'express-async-handler'
import {AgencyToken} from '../csrs/model/agencyToken'
import {AgencyTokenService} from '../lib/agencyTokenService'
import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {Validator} from '../learning-catalogue/validator/validator'
import {Validate} from './formValidator'
import {AgencyTokenFactory} from '../csrs/model/agencyTokenFactory'
import {OrganisationalUnitControllerBase} from './organisationalUnitControllerBase'
const { xss } = require('express-xss-sanitizer')


export class AgencyTokenController extends OrganisationalUnitControllerBase<AgencyToken> {
	constructor(
		validator: Validator<AgencyToken>,
		private agencyTokenService: AgencyTokenService,
		organisationalUnitService: OrganisationalUnitService,
		private agencyTokenFactory: AgencyTokenFactory,
	) {
		super(validator, organisationalUnitService)
	}
    protected getControllerName(): string {
        return 'AgencyTokenController'
    }

	/* istanbul ignore next */
	protected setRouterPaths() {
		this.router.get('/content-management/organisations/:organisationalUnitId/agency-token', xss(), asyncHandler(this.addEditAgencyToken()))
		this.router.post('/content-management/organisations/:organisationalUnitId/agency-token', xss(), asyncHandler(this.createAgencyToken()))
		this.router.post('/content-management/organisations/:organisationalUnitId/agency-token/edit', xss(), asyncHandler(this.updateAgencyToken()))
		this.router.get('/content-management/organisations/:organisationalUnitId/agency-token/delete', xss(), asyncHandler(this.deleteAgencyTokenConfirmation()))
		this.router.post('/content-management/organisations/:organisationalUnitId/agency-token/delete', xss(), asyncHandler(this.deleteAgencyToken()))
		this.router.post('/content-management/organisations/:organisationalUnitId/agency-token/domain', xss(), asyncHandler(this.addDomainToAgencyTokenWithinSession()))
		this.router.post('/content-management/organisations/:organisationalUnitId/agency-token/domain/delete', xss(), asyncHandler(this.deleteDomainFromAgencyTokenWithinSession()))
	}

	public addEditAgencyToken() {
		return async (request: Request, response: Response) => {
			const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit

			if (!request.session!.agencyTokenNumber) {
				if (organisationalUnit.agencyToken) {
					request.session!.agencyTokenNumber = organisationalUnit.agencyToken.token
				} else {
					request.session!.agencyTokenNumber = this.agencyTokenService.generateToken()
				}
			}
			const agencyTokenNumber = request.session!.agencyTokenNumber

			if (organisationalUnit.agencyToken && !request.session!.domainsForAgencyToken) {
				request.session!.domainsForAgencyToken = organisationalUnit.agencyToken.agencyDomains.map(agencyDomain => {
					return agencyDomain.domain
				})
			}

			const domainsForAgencyToken = request.session!.domainsForAgencyToken

			request.session!.save(() => {
				response.render('page/organisation/add-edit-agency-token', {
					organisationalUnit: organisationalUnit,
					agencyTokenNumber: agencyTokenNumber,
					domainsForAgencyToken: domainsForAgencyToken,
				})
			})
		}
	}

	public redirectToAddEditAgencyTokenWithError(request: Request, response: Response, error: any) {
		const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
		request.session!.sessionFlash = {errors: error}

		return request.session!.save(() => {
			response.redirect(`/content-management/organisations/${organisationalUnit.id}/agency-token`)
		})
	}

	@Validate({
		fields: ['all'],
		redirect: '/content-management/organisations/:organisationalUnitId/agency-token',
	})
	public createAgencyToken() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit

			this.logger.debug(`Adding agency token to organisation: ${organisationalUnit.name}`)

			const capacityIsValid = this.agencyTokenService.validateCapacity(request.body.capacity)
			if (!capacityIsValid) {
				const error = {fields: {capacity: ['agencyToken.validation.capacity.invalid']}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			const domainsIsValid = this.agencyTokenService.validateDomains(request.session!.domainsForAgencyToken)
			if (!domainsIsValid) {
				let errorText = ''
				if (!(Array.isArray(request.session!.domainsForAgencyToken) && request.session!.domainsForAgencyToken.length)) {
					errorText = 'agencyToken.validation.domains.empty'
				} else {
					errorText = 'agencyToken.validation.domains.invalid'
				}
				const error = {fields: {domains: [errorText]}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			const agencyTokenNumberFormatIsValid = this.agencyTokenService.validateAgencyTokenNumber(request.body.tokenNumber)
			if (!agencyTokenNumberFormatIsValid) {
				const error = {fields: {tokenNumber: ['agencyToken.validation.tokenNumber.invalidFormat']}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			const data = {
				...request.body,
				domains: request.session!.domainsForAgencyToken,
			}
			const agencyToken: AgencyToken = this.agencyTokenFactory.create(data)

			await this.organisationalUnitService
				.createAgencyToken(organisationalUnit.id, agencyToken)
				.then(() => {
					this.deleteAgencyTokenDataStoredInSession(request)
					response.redirect(`/content-management/organisations/${organisationalUnit.id}/overview`)
				})
				.catch(rejected => {
					if (rejected.response.status == 400) {
						const error = {fields: {capacity: rejected.response.data.capacity}, size: 1}
						return this.redirectToAddEditAgencyTokenWithError(request, response, error)
					} else {
						next(rejected)
					}
				})
		}
	}

	@Validate({
		fields: ['all'],
		redirect: '/content-management/organisations/:organisationalUnitId/agency-token',
	})
	public updateAgencyToken() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit

			this.logger.debug(`Updating agency token for organisation: ${organisationalUnit.name}`)

			const capacityIsValid = this.agencyTokenService.validateCapacity(request.body.capacity)
			if (!capacityIsValid) {
				const error = {fields: {capacity: ['agencyToken.validation.capacity.invalid']}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			if (request.body.capacity < organisationalUnit.agencyToken!.capacityUsed) {
				const error = {fields: {capacity: ['agencyToken.validation.capacity.lessThanCurrentUsage']}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			const domainsIsValid = this.agencyTokenService.validateDomains(request.session!.domainsForAgencyToken)
			if (!domainsIsValid) {
				let errorText = ''
				if (!(Array.isArray(request.session!.domainsForAgencyToken) && request.session!.domainsForAgencyToken.length)) {
					errorText = 'agencyToken.validation.domains.empty'
				} else {
					errorText = 'agencyToken.validation.domains.invalid'
				}
				const error = {fields: {domains: [errorText]}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			const agencyTokenNumberFormatIsValid = this.agencyTokenService.validateAgencyTokenNumber(request.body.tokenNumber)
			if (!agencyTokenNumberFormatIsValid) {
				const error = {fields: {tokenNumber: ['agencyToken.validation.tokenNumber.invalidFormat']}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			const data = {
				...request.body,
				domains: request.session!.domainsForAgencyToken,
			}
			const agencyToken: AgencyToken = this.agencyTokenFactory.create(data)

			await this.organisationalUnitService
				.updateAgencyToken(organisationalUnit.id, agencyToken)
				.then(() => {
					this.deleteAgencyTokenDataStoredInSession(request)
					response.redirect(`/content-management/organisations/${organisationalUnit.id}/overview`)
				})
				.catch(rejected => {
					if (rejected.response.status == 400) {
						const error = {fields: {capacity: rejected.response.data.capacity}, size: 1}
						return this.redirectToAddEditAgencyTokenWithError(request, response, error)
					} else {
						next(rejected)
					}
				})
		}
	}

	public deleteAgencyTokenConfirmation() {
		return async (request: Request, response: Response) => {
			response.render('page/organisation/delete-agency-token')
		}
	}

	public deleteAgencyToken() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const organisationalUnit = response.locals.organisationalUnit

			this.logger.debug(`Deleting agency token from organisation: ${organisationalUnit.name}`)

			await this.organisationalUnitService
				.deleteAgencyToken(organisationalUnit.id)
				.then(() => {
					request.session!.sessionFlash = {displayAgencyTokenRemovedMessage: true, organisationalUnit: organisationalUnit}
					return response.redirect(`/content-management/organisations/${organisationalUnit.id}/overview`)
				})
				.catch(error => {
					next(error)
				})
		}
	}

	public addDomainToAgencyTokenWithinSession() {
		return async (request: Request, response: Response) => {
			const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
			const domainToAdd = request.body.domainToAdd

			const domainIsValid = this.agencyTokenService.validateDomains([domainToAdd])
			if (!domainIsValid) {
				const error = {fields: {domains: ['agencyToken.validation.domains.invalidFormat']}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			if (request.session!.domainsForAgencyToken == undefined) {
				request.session!.domainsForAgencyToken = []
			}

			if (request.session!.domainsForAgencyToken.includes(domainToAdd)) {
				const error = {fields: {domains: ['agencyToken.validation.domains.alreadyExists']}, size: 1}
				return this.redirectToAddEditAgencyTokenWithError(request, response, error)
			}

			request.session!.domainsForAgencyToken.push(domainToAdd)

			request.session!.save(() => {
				response.redirect(`/content-management/organisations/${organisationalUnit.id}/agency-token`)
			})
		}
	}

	public deleteDomainFromAgencyTokenWithinSession() {
		return async (request: Request, response: Response) => {
			const organisationalUnit: OrganisationalUnit = response.locals.organisationalUnit
			const domainToDelete = request.body.domainToDelete

			request.session!.domainsForAgencyToken.forEach((domain: string, index: number) => {
				if (domain == domainToDelete) {
					request.session!.domainsForAgencyToken.splice(index, 1)
				}
			})

			request.session!.save(() => {
				response.redirect(`/content-management/organisations/${organisationalUnit.id}/agency-token`)
			})
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
