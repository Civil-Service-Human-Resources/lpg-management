import {NextFunction, Request, Response} from 'express'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import * as asyncHandler from 'express-async-handler'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'
import {Controller} from '../controller'

export abstract class OrganisationalUnitControllerBase extends Controller {

	protected constructor (
		protected controllerName: string,
		protected organisationalUnitService: OrganisationalUnitService) {
		super("/content-management/organisations", controllerName)
		this.getOrganisationFromRouterParamAndSetOnLocals()
	}

	protected getControllerMiddleware(): ((req: Request, res: Response, next: NextFunction) => void)[] {
		return [
			this.checkForOrgManagerRole()
		]
	}

	private checkForOrgManagerRole() {
		return (req: Request, res: Response, next: NextFunction) => {
			if (req.user && req.user.isOrganisationManagerOrSuperUser()) {
				next();
			}
			else {
				if (req.user && req.user.uid) {
					this.logger.error('Rejecting user without organisation manager role ' + req.user.uid + ' with IP '
						+ req.ip + ' from page ' + req.originalUrl);
				}
				res.render('page/unauthorised');
			}
		}
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
