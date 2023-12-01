import {NextFunction, Request, Response} from 'express'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import * as asyncHandler from 'express-async-handler'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {Controller} from '../controller'
import {Role} from '../../identity/identity'

export abstract class OrganisationalUnitControllerBase extends Controller {

	protected constructor (
		protected controllerName: string,
		protected organisationalUnitService: OrganisationalUnitService) {
		super("/content-management/organisations", controllerName)
		this.getOrganisationFromRouterParamAndSetOnLocals()
	}

	protected getRequiredRoles(): Role[] {
		return [Role.ORGANISATION_MANAGER, Role.CSL_AUTHOR, Role.LEARNING_MANAGER]
	}

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

}
