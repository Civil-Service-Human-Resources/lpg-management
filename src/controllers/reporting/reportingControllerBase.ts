import {Controller} from '../controller'
import {CompoundRoleBase, reporterRole} from '../../identity/identity'
import {ReportService} from '../../report-service'

export abstract class ReportingControllerBase extends Controller {

	protected constructor (
		protected controllerName: string,
		protected reportService: ReportService) {
		super("/reporting", controllerName)
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return reporterRole.compoundRoles
	}

}
