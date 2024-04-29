import {Controller} from '../controller'
import {AllOfCompoundRole, AnyOfCompoundRole, CompoundRoleBase, Role} from '../../identity/identity'
import {ReportService} from '../../report-service'

export abstract class CourseCompletionsControllerBaseBase extends Controller {

	protected constructor (
		protected controllerName: string,
		protected reportService: ReportService) {
		super("/reporting/course-completions", controllerName)
	}

	protected getRequiredRoles(): CompoundRoleBase[] {
		return [new AllOfCompoundRole([Role.MVP_REPORTER]),
			new AnyOfCompoundRole([Role.ORGANISATION_REPORTER, Role.CSHR_REPORTER])]
	}

}
