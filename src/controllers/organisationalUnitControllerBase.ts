import {FormController} from './formController'
import {getLogger} from '../utils/logger'
import {NextFunction, Request, Response, Router} from 'express'
import {Validator} from '../learning-catalogue/validator/validator'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import asyncHandler from 'express-async-handler'
import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
import * as winston from 'winston'

export abstract class OrganisationalUnitControllerBase<T> implements FormController {
	protected logger: winston.Logger
	protected router: Router

	protected constructor (
		public validator: Validator<T>,
		protected organisationalUnitService: OrganisationalUnitService) {
		this.router = Router()
		this.logger = getLogger(this.getControllerName())
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
	protected abstract setRouterPaths(): void

	protected abstract getControllerName(): string
}
