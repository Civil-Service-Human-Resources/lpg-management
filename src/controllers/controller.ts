import {NextFunction, Request, Response, Router} from 'express'
import {Route} from './route'
import * as winston from 'winston'
import {getLogger} from '../utils/logger'
import {CompoundRoleBase} from '../identity/identity'
import {compoundRoleCheckMiddleware} from './middleware/roleCheckMiddleware'

export abstract class Controller {

	private _router: Router = Router()
	protected logger: winston.Logger
	protected constructor(private _path: string,
						  protected controllerName: string) {
		this.logger = getLogger(controllerName)
	}

	get router(): Router {
		return this._router
	}

	get path(): string {
		return this._path
	}

	protected getRoutes(): Route[] {
		return []
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return []
	}

	protected getControllerMiddleware(): ((req: Request, res: Response, next: NextFunction) => void)[] {
		return []
	}

	private applyRoleRestrictions() {
		const requiredRoles = this.getRequiredRoles()
		if (requiredRoles.length > 0) {
			this.logger.debug(`Restricting controller to roles: [${requiredRoles.map(rr => rr.getDescription())}]`)
			this.router.use(compoundRoleCheckMiddleware(requiredRoles))
		}
	}

	public buildRouter = (): Router => {
		this.logger.debug(`Registering controller '${this.controllerName}'`)
		const controllerMiddleware = this.getControllerMiddleware()
		this.applyRoleRestrictions()
		if (controllerMiddleware.length > 0) {
			this.logger.debug(`Registering ${controllerMiddleware.length} controller middleware`)
			this.router.use(controllerMiddleware)
		}
		const controllerRoutes = this.getRoutes()
		this.logger.debug(`Registering ${controllerRoutes.length} controller routes`)
		for (const route of controllerRoutes) {
			this.logger.debug(`Registering endpoint ${route.method} ${this.path}${route.path}`)
			switch (route.method) {
				case 'GET':
					this.router.get(route.path, route.localMiddleware, route.handler);
					break;
				case 'POST':
					this.router.post(route.path, route.localMiddleware, route.handler);
					break;
				case 'PUT':
					this.router.put(route.path, route.localMiddleware, route.handler);
					break;
				case 'DELETE':
					this.router.delete(route.path, route.localMiddleware, route.handler);
					break;
				default:
			}
		}

		return this.router;
	};
}
