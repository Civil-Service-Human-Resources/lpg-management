import {NextFunction, Request, Response} from 'express'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import * as asyncHandler from 'express-async-handler'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {Controller} from '../controller'
import {IUserRole, organisationManagerRole} from '../../identity/identity'
import {SessionableObjectService} from '../reporting/utils'
import {EditAgencyToken} from './model/editAgencyToken'

export abstract class OrganisationalUnitControllerBase extends Controller {

	protected agencyTokenPageModelSession = new SessionableObjectService("agencyTokenPageModel", EditAgencyToken)

	protected constructor (
		protected controllerName: string,
		protected organisationalUnitService: OrganisationalUnitService) {
		super("/content-management/organisations", controllerName)
		this.getOrganisationFromRouterParamAndSetOnLocals()
	}

	protected getRequiredRole(): IUserRole | undefined {
		return organisationManagerRole
	}

	// prettier-ignore
	private getOrganisationFromRouterParamAndSetOnLocals() {
		this.router.param('organisationalUnitId', asyncHandler(async (req: Request, res: Response, next: NextFunction, organisationalUnitId: number) => {
				const organisationalUnit: OrganisationalUnit = await this.organisationalUnitService.getOrganisation(organisationalUnitId)
				if (organisationalUnit) {
					res.locals.organisationalUnit = organisationalUnit
					next()
				} else {
					res.status(404)
					return res.render("page/not-found")
				}
			})
		)
	}

}
