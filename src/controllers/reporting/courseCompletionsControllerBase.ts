import {Controller} from '../controller'
// import {AllOfCompoundRole, AnyOfCompoundRole, CompoundRoleBase, Role} from '../../identity/identity'
import {ReportService} from '../../report-service'
import {CompoundRoleBase, mvpReportingRole} from '../../identity/identity'

export abstract class CourseCompletionsControllerBaseBase extends Controller {

	protected constructor (
		protected controllerName: string,
		protected reportService: ReportService) {
		super("/reporting/course-completions", controllerName)
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return mvpReportingRole.compoundRoles
	}

}
