import {Controller} from '../controller'
import {CompoundRoleBase, registeredLearnerReportingRole} from '../../identity/identity'
import {getRequest, Route} from '../route'
import {Request, Response} from 'express'

export class RegisteredLearnersController extends Controller {

	constructor() {
		super("/reporting/registered-learners", 'RegisteredLearnersController')
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return registeredLearnerReportingRole.compoundRoles
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/', this.renderPage()),
		]
	}

	renderPage() {
		return async (request: Request, response: Response) => {
			return response.send('registered learners')
		}
	}
}
